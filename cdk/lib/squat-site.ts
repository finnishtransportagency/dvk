import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as cloudfront_origins from 'aws-cdk-lib/aws-cloudfront-origins';
import { CfnOutput, Duration, Stack } from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as cdk from 'aws-cdk-lib';
import {
  AllowedMethods,
  BehaviorOptions,
  CachePolicy,
  CfnPublicKey,
  GeoRestriction,
  OriginProtocolPolicy,
  OriginRequestCookieBehavior,
  OriginRequestHeaderBehavior,
  OriginRequestPolicy,
  OriginRequestQueryStringBehavior,
  OriginSslPolicy,
  PriceClass,
  ResponseHeadersPolicy,
  ViewerProtocolPolicy,
} from 'aws-cdk-lib/aws-cloudfront';
import { HttpOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';
import Config from './config';
import * as fs from 'fs';
import { BucketEncryption } from 'aws-cdk-lib/aws-s3';
import { SSMParameterReader } from './ssm-parameter-reader';
import { getNewStaticBucketName } from './lambda/environment';
import { FEATURE_CACHE_DURATION } from './lambda/graphql/cache';

interface SquatSiteProps {
  domainName: string;
  siteSubDomain: string;
  cloudfrontCertificateArn?: string;
  env: string;
}

export class SquatSite extends Construct {
  constructor(parent: Stack, id: string, props: SquatSiteProps) {
    super(parent, id);

    const config = new Config(this);

    const siteDomain = props.siteSubDomain + '.' + props.domainName;
    const cloudfrontOAI = new cloudfront.OriginAccessIdentity(this, 'cloudfront-OAI', {
      comment: `OAI for ${id}-${props.env}`,
    });

    new CfnOutput(this, 'Site', {
      value: 'https://' + siteDomain,
      description: 'Site URL',
      exportName: 'DvkSiteUrl' + props.env,
    });

    const s3DeletePolicy: Pick<s3.BucketProps, 'removalPolicy' | 'autoDeleteObjects'> = {
      removalPolicy: Config.isPermanentEnvironment() ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: Config.isPermanentEnvironment() ? undefined : true,
    };

    // Squat bucket
    const squatBucket = new s3.Bucket(this, 'SiteBucket', {
      bucketName: `squat.${siteDomain}`,
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: BucketEncryption.S3_MANAGED,
      ...s3DeletePolicy,
    });

    // Grant access to cloudfront
    squatBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        actions: ['s3:GetObject'],
        resources: [squatBucket.arnForObjects('*')],
        principals: [new iam.CanonicalUserPrincipal(cloudfrontOAI.cloudFrontOriginAccessIdentityS3CanonicalUserId)],
      })
    );
    new CfnOutput(parent, 'Bucket', {
      value: squatBucket.bucketName,
      description: 'The name of Squat app S3',
      exportName: 'SquatBucket' + props.env,
    });

    const dvkBucket = new s3.Bucket(this, 'DVKBucket', {
      bucketName: `dvk.${siteDomain}`,
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: BucketEncryption.S3_MANAGED,
      ...s3DeletePolicy,
    });
    dvkBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        actions: ['s3:GetObject'],
        resources: [dvkBucket.arnForObjects('*')],
        principals: [new iam.CanonicalUserPrincipal(cloudfrontOAI.cloudFrontOriginAccessIdentityS3CanonicalUserId)],
      })
    );
    new CfnOutput(parent, 'DVK Bucket name', {
      value: dvkBucket.bucketName,
      description: 'The name of DVK app S3',
      exportName: 'DVKBucket' + props.env,
    });

    const adminBucket = new s3.Bucket(this, 'AdminSiteBucket', {
      bucketName: `admin.${siteDomain}`,
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: BucketEncryption.S3_MANAGED,
      ...s3DeletePolicy,
    });
    adminBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        actions: ['s3:GetObject'],
        resources: [adminBucket.arnForObjects('*')],
        principals: [new iam.CanonicalUserPrincipal(cloudfrontOAI.cloudFrontOriginAccessIdentityS3CanonicalUserId)],
      })
    );
    new CfnOutput(parent, 'AdminBucket', {
      value: adminBucket.bucketName,
      description: 'The name of Admin app S3',
      exportName: 'AdminBucket' + props.env,
    });

    const previewBucket = new s3.Bucket(this, 'PreviewSiteBucket', {
      bucketName: `preview.${siteDomain}`,
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: BucketEncryption.S3_MANAGED,
      ...s3DeletePolicy,
    });
    previewBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        actions: ['s3:GetObject'],
        resources: [previewBucket.arnForObjects('*')],
        principals: [new iam.CanonicalUserPrincipal(cloudfrontOAI.cloudFrontOriginAccessIdentityS3CanonicalUserId)],
      })
    );
    new CfnOutput(parent, 'PreviewBucket', {
      value: previewBucket.bucketName,
      description: 'The name of Preview app S3',
      exportName: 'PreviewBucket' + props.env,
    });

    // Accesss log bucket
    const logBucket = new s3.Bucket(this, 'LogBucket', {
      bucketName: `dvk-access-logs-${props.env}`,
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: BucketEncryption.S3_MANAGED,
      objectOwnership: s3.ObjectOwnership.OBJECT_WRITER,
      ...s3DeletePolicy,
    });
    new CfnOutput(parent, 'AccessLogBucket', {
      value: logBucket.bucketName,
      description: 'The name of cloudfront access log bucket',
      exportName: 'AccessLogBucket' + props.env,
    });

    // TLS certificate
    let certificate, domainNames;
    if (props.cloudfrontCertificateArn) {
      certificate = acm.Certificate.fromCertificateArn(this, 'certificate', props.cloudfrontCertificateArn);
      domainNames = [siteDomain];
      new CfnOutput(parent, 'Certificate', {
        value: certificate.certificateArn,
        description: 'Cloudfront certificate ARN',
        exportName: 'DvkCertificateARN' + props.env,
      });
    }

    // Cloudfront function suorittamaan basic autentikaatiota
    let authFunction;
    if (!Config.isProductionEnvironment()) {
      const basicUserName = config.getStringParameter('BasicUsername');
      const basicPassword = config.getStringParameter('BasicPassword');
      const authString = cdk.Fn.base64(basicUserName + ':' + basicPassword);

      const authSourceCode = fs.readFileSync(`${__dirname}/lambda/auth/authFunction.js`).toString('utf-8');
      const authFunctionCode = cdk.Fn.sub(authSourceCode, {
        AUTH_STRING: authString,
      });

      authFunction = new cloudfront.Function(this, 'DvkAuthFunction' + props.env, {
        code: cloudfront.FunctionCode.fromInline(authFunctionCode),
        runtime: cloudfront.FunctionRuntime.JS_2_0,
      });
    }

    // Cloudfront function reitittamaan squat pyyntoja sovelluksen juureen
    const routerSourceCode = fs.readFileSync(`${__dirname}/lambda/router/squatRequestRouter.js`).toString('utf-8');
    const cfFunction = new cloudfront.Function(this, 'SquatRouterFunction' + props.env, {
      code: cloudfront.FunctionCode.fromInline(routerSourceCode),
      runtime: cloudfront.FunctionRuntime.JS_2_0,
    });

    const strictTransportSecurityResponsePolicy = new cloudfront.ResponseHeadersPolicy(this, 'STSResponsePolicy', {
      responseHeadersPolicyName: 'STSResponsePolicy' + props.env,
      securityHeadersBehavior: {
        strictTransportSecurity: { accessControlMaxAge: Duration.seconds(3600), includeSubdomains: true, override: true },
      },
    });

    const squatBehavior: BehaviorOptions = {
      origin: cloudfront_origins.S3BucketOrigin.withOriginAccessIdentity(squatBucket, { originAccessIdentity: cloudfrontOAI }),
      compress: true,
      allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
      viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      functionAssociations: [
        {
          function: cfFunction,
          eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
        },
      ],
      responseHeadersPolicy: Config.isPermanentEnvironment() ? strictTransportSecurityResponsePolicy : undefined,
    };

    const adminRouterSourceCode = fs.readFileSync(`${__dirname}/lambda/router/adminRequestRouter.js`).toString('utf-8');
    const adminCfFunction = new cloudfront.Function(this, 'AdminRouterFunction' + props.env, {
      code: cloudfront.FunctionCode.fromInline(adminRouterSourceCode),
      runtime: cloudfront.FunctionRuntime.JS_2_0,
    });
    const key = new SSMParameterReader(this, 'FrontendPublicKey' + Config.getEnvironment(), {
      parameterName: `/${Config.getEnvironment()}/CloudFrontPublicKey`,
      region: 'eu-west-1',
    });
    const publicKey = new cloudfront.PublicKey(this, 'FrontendPublicKey', {
      publicKeyName: 'FrontendPublicKey' + props.env,
      encodedKey: key.getParameterValue(),
    });
    const cfnKey: CfnPublicKey = publicKey.node.defaultChild as CfnPublicKey;
    type Writeable<T> = { -readonly [P in keyof T]: T[P] };
    const cfnKeyConfig = cfnKey.publicKeyConfig as Writeable<CfnPublicKey.PublicKeyConfigProperty>;
    cfnKeyConfig.callerReference = cfnKeyConfig.callerReference + props.env;
    config.saveStringParameter(`/${Config.getEnvironment()}/CloudFrontPublicKeyId`, publicKey.publicKeyId);
    new CfnOutput(this, 'FrontendPublicKeyIdOutput', {
      value: publicKey.publicKeyId || '',
    });
    const keyGroups = [
      new cloudfront.KeyGroup(this, 'FrontendKeyGroup', {
        keyGroupName: 'FrontendKeyGroup' + props.env,
        items: [publicKey],
      }),
    ];

    const adminBehavior: BehaviorOptions = {
      origin: cloudfront_origins.S3BucketOrigin.withOriginAccessIdentity(adminBucket, { originAccessIdentity: cloudfrontOAI }),
      compress: true,
      allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
      viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      functionAssociations: [
        {
          function: adminCfFunction,
          eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
        },
      ],
      responseHeadersPolicy: Config.isPermanentEnvironment() ? strictTransportSecurityResponsePolicy : undefined,
      trustedKeyGroups: keyGroups,
    };

    const previewRouterSourceCode = fs.readFileSync(`${__dirname}/lambda/router/previewRequestRouter.js`).toString('utf-8');
    const previewCfFunction = new cloudfront.Function(this, 'PreviewRouterFunction' + props.env, {
      code: cloudfront.FunctionCode.fromInline(previewRouterSourceCode),
      runtime: cloudfront.FunctionRuntime.JS_2_0,
    });

    const previewBehavior: BehaviorOptions = {
      origin: cloudfront_origins.S3BucketOrigin.withOriginAccessIdentity(previewBucket, { originAccessIdentity: cloudfrontOAI }),
      compress: true,
      allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
      viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      functionAssociations: [
        {
          function: previewCfFunction,
          eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
        },
      ],
      responseHeadersPolicy: Config.isPermanentEnvironment() ? strictTransportSecurityResponsePolicy : undefined,
      trustedKeyGroups: keyGroups,
    };

    const dvkRouterSourceCode = fs.readFileSync(`${__dirname}/lambda/router/dvkRequestRouter.js`).toString('utf-8');
    const dvkCfFunction = new cloudfront.Function(this, 'DvkRouterFunction' + props.env, {
      code: cloudfront.FunctionCode.fromInline(dvkRouterSourceCode),
      runtime: cloudfront.FunctionRuntime.JS_2_0,
    });

    const dvkBehavior = {
      origin: cloudfront_origins.S3BucketOrigin.withOriginAccessIdentity(dvkBucket, { originAccessIdentity: cloudfrontOAI }),
      compress: true,
      allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
      viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      functionAssociations: [
        {
          function: dvkCfFunction,
          eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
        },
      ],
      responseHeadersPolicy: Config.isPermanentEnvironment() ? strictTransportSecurityResponsePolicy : undefined,
    };

    const importedLoadBalancerDnsName = cdk.Fn.importValue('LoadBalancerDnsName' + props.env);
    const importedAppSyncAPIURL = cdk.Fn.importValue('AppSyncAPIURL' + props.env);
    const importedAppSyncAPIKey = cdk.Fn.importValue('AppSyncAPIKey' + props.env);
    const corsResponsePolicy = new cloudfront.ResponseHeadersPolicy(this, 'CORSResponsePolicy', {
      responseHeadersPolicyName: 'CORSResponsePolicy' + props.env,
      corsBehavior: {
        accessControlAllowCredentials: false,
        accessControlAllowMethods: ['ALL'],
        accessControlAllowOrigins: ['*'],
        accessControlAllowHeaders: ['*'],
        accessControlExposeHeaders: ['fetchedDate'],
        originOverride: false,
        accessControlMaxAge: Duration.seconds(3600),
      },
      securityHeadersBehavior: {
        strictTransportSecurity: { accessControlMaxAge: Duration.seconds(3600), includeSubdomains: true, override: true },
      },
    });
    const staticSourceCode = fs.readFileSync(`${__dirname}/lambda/router/replaceFunction.js`).toString('utf-8');
    const staticFunctionCode = cdk.Fn.sub(staticSourceCode, {
      REPLACE_PATH: 's3static',
    });
    const staticCfFunction = new cloudfront.Function(this, 'StaticRouterFunction' + props.env, {
      code: cloudfront.FunctionCode.fromInline(staticFunctionCode),
      runtime: cloudfront.FunctionRuntime.JS_2_0,
    });
    const staticBucket = s3.Bucket.fromBucketName(this, 'NewStaticBucket', getNewStaticBucketName());
    const originAccessIdentityId = cdk.Fn.importValue('OriginAccessIdentityId' + props.env);
    const staticBehavior: BehaviorOptions = {
      origin: cloudfront_origins.S3BucketOrigin.withOriginAccessIdentity(staticBucket, {
        originAccessIdentity: cloudfront.OriginAccessIdentity.fromOriginAccessIdentityId(this, 'StaticOAI', originAccessIdentityId),
      }),
      originRequestPolicy: Config.isPermanentEnvironment() ? undefined : OriginRequestPolicy.CORS_CUSTOM_ORIGIN,
      responseHeadersPolicy: Config.isDeveloperOrDevEnvironment() ? corsResponsePolicy : strictTransportSecurityResponsePolicy,
      compress: true,
      allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
      viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      functionAssociations: [
        {
          function: staticCfFunction,
          eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
        },
      ],
    };

    const vectorMapBehavior: BehaviorOptions = {
      origin: new cloudfront_origins.HttpOrigin(config.getGlobalStringParameter('SOAApiUrl'), {
        customHeaders: { 'x-api-key': config.getGlobalStringParameter('BGMapSOAApiKey') },
      }),
      originRequestPolicy: OriginRequestPolicy.CORS_CUSTOM_ORIGIN,
      responseHeadersPolicy: Config.isPermanentEnvironment() ? strictTransportSecurityResponsePolicy : corsResponsePolicy,
      allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
      viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      compress: true,
      cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
    };

    const apiKeyParameterReader = new SSMParameterReader(this, 'WeatherSOAApiKey' + Config.getEnvironment(), {
      parameterName: 'WeatherSOAApiKey',
      region: 'eu-west-1',
    });
    const originRequestPolicy = new OriginRequestPolicy(this, 'FMIPolicy' + Config.getEnvironment(), {
      cookieBehavior: OriginRequestCookieBehavior.all(),
      headerBehavior: OriginRequestHeaderBehavior.none(),
      queryStringBehavior: OriginRequestQueryStringBehavior.all(),
      originRequestPolicyName: 'FMIPolicy-' + Config.getEnvironment(),
    });
    const iceMapBehavior: BehaviorOptions = {
      origin: new cloudfront_origins.HttpOrigin(config.getGlobalStringParameter('SOAApiUrl'), {
        customHeaders: { 'x-api-key': apiKeyParameterReader.getParameterValue() },
      }),
      originRequestPolicy,
      responseHeadersPolicy: Config.isPermanentEnvironment() ? strictTransportSecurityResponsePolicy : corsResponsePolicy,
      allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
      viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      compress: true,
      cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
    };

    const proxyBehavior = this.useProxy()
      ? this.createProxyBehavior(config.getStringParameter('DMZProxyEndpoint'), authFunction, true, false, strictTransportSecurityResponsePolicy)
      : undefined;
    const apiProxyBehavior = proxyBehavior || this.createProxyBehavior(importedLoadBalancerDnsName, authFunction, false);
    // add type and vaylaluokka as cache keys
    // set default ttl to same as current s3 cache, feature handler returns cache-control headers for mareographs, observations and buoys
    const featureLoaderQueryStringCachePolicy = this.createApiCachePolicy('DvkFeatureCachePolicy-' + props.env, ['type', 'vaylaluokka'], {
      defaultTtl: Duration.seconds(FEATURE_CACHE_DURATION),
      minTtl: Duration.seconds(0),
      maxTtl: Duration.seconds(FEATURE_CACHE_DURATION),
    });
    const featureLoaderProxyBehavior = this.useProxy()
      ? this.createProxyBehavior(
          config.getStringParameter('DMZProxyEndpoint'),
          authFunction,
          true,
          false,
          strictTransportSecurityResponsePolicy,
          undefined,
          featureLoaderQueryStringCachePolicy
        )
      : this.createProxyBehavior(importedLoadBalancerDnsName, authFunction, false, false, undefined, undefined, featureLoaderQueryStringCachePolicy);
    const aisCachePolicy = this.createApiCachePolicy('DvkAisCachePolicy-' + props.env);
    const aisProxyBehavior = this.useProxy()
      ? this.createProxyBehavior(
          config.getStringParameter('DMZProxyEndpoint'),
          authFunction,
          true,
          false,
          strictTransportSecurityResponsePolicy,
          undefined,
          aisCachePolicy
        )
      : this.createProxyBehavior(importedLoadBalancerDnsName, authFunction, false, false, undefined, undefined, aisCachePolicy);
    const graphqlProxyBehavior =
      proxyBehavior ||
      this.createProxyBehavior(cdk.Fn.parseDomainName(importedAppSyncAPIURL), authFunction, true, true, corsResponsePolicy, {
        'x-api-key': importedAppSyncAPIKey,
      });

    // separate behaviors for featureloader and ais api paths so they can have different cache policies
    const additionalBehaviors: Record<string, BehaviorOptions> = {
      'squat*': squatBehavior,
      's3static/*': staticBehavior,
      '/graphql': graphqlProxyBehavior,
      '/api/featureloader*': featureLoaderProxyBehavior,
      '/api/ais*': aisProxyBehavior,
      '/api/*': apiProxyBehavior,
      'mml/*': vectorMapBehavior,
      'fmi/*': iceMapBehavior,
      'trafiaineistot/*': iceMapBehavior,
      'yllapito/graphql': graphqlProxyBehavior,
      'yllapito/kirjaudu.html': apiProxyBehavior,
      'yllapito/api/*': apiProxyBehavior,
      'yllapito*': adminBehavior,
      'esikatselu/graphql': graphqlProxyBehavior,
      'esikatselu/api/*': apiProxyBehavior,
      'esikatselu*': previewBehavior,
      '/oauth2/*': apiProxyBehavior,
      '/sso/*': apiProxyBehavior,
      '/jwtclaims': apiProxyBehavior,
    };
    // github webhook for cicd pipelines only in 'dev'
    if (Config.getEnvironment() === 'dev') {
      // has to be routed through 'vaylapilvi' proxies to a dedicated internal alb
      // no basic authentication
      additionalBehaviors['/webhook*'] = this.createProxyBehavior(
        config.getStringParameter('DMZProxyEndpoint'),
        undefined,
        true,
        false,
        strictTransportSecurityResponsePolicy
      );
    }

    // CloudFront webacl reader and id
    const customSSMParameterReader = new SSMParameterReader(this, 'DVKWebAclReader' + Config.getEnvironment(), {
      parameterName: 'WebAclId' + Config.getEnvironment(),
      region: 'us-east-1',
    });
    const webAclId = customSSMParameterReader.getParameterValue();
    const geoRestriction = Config.isDeveloperEnvironment() ? GeoRestriction.allowlist('FI') : GeoRestriction.denylist('BY', 'RU');
    // CloudFront distribution
    const distribution = new cloudfront.Distribution(this, 'SiteDistribution', {
      certificate,
      defaultRootObject: 'index.html',
      domainNames,
      minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
      additionalBehaviors,
      defaultBehavior: dvkBehavior,
      priceClass: PriceClass.PRICE_CLASS_100,
      webAclId,
      geoRestriction,
      errorResponses: [
        { httpStatus: 403, responseHttpStatus: 403, responsePagePath: '/forbidden.html' },
        { httpStatus: 404, responseHttpStatus: 404, responsePagePath: '/notfound.html' },
        { httpStatus: 500, responseHttpStatus: 500, responsePagePath: '/error.html' },
      ],
      enableLogging: true,
      logBucket: logBucket,
    });

    new CfnOutput(parent, 'DistributionId', {
      value: distribution.distributionId,
      description: 'Squat distribution name',
      exportName: 'SquatDistribution' + props.env,
    });
    new CfnOutput(parent, 'CloudFrontDomainName', {
      value: distribution.distributionDomainName,
      description: 'Squat distribution domain name',
      exportName: 'CloudFrontDomainName' + props.env,
    });
  }

  private useProxy(): boolean {
    return Config.isPermanentEnvironment();
  }

  private createProxyBehavior(
    domainName: string,
    authFunction: cloudfront.Function | undefined,
    useSSL = true,
    useCORS = false,
    responsePolicy: ResponseHeadersPolicy | undefined = undefined,
    customHeaders: Record<string, string> | undefined = undefined,
    cachePolicy = CachePolicy.CACHING_DISABLED
  ) {
    const dmzBehavior: BehaviorOptions = {
      compress: true,
      origin: new HttpOrigin(domainName, {
        originSslProtocols: [OriginSslPolicy.TLS_V1_2, OriginSslPolicy.TLS_V1_2, OriginSslPolicy.TLS_V1, OriginSslPolicy.SSL_V3],
        protocolPolicy: useSSL ? OriginProtocolPolicy.HTTPS_ONLY : OriginProtocolPolicy.HTTP_ONLY,
        customHeaders,
      }),
      cachePolicy,
      originRequestPolicy: useCORS ? OriginRequestPolicy.CORS_CUSTOM_ORIGIN : OriginRequestPolicy.ALL_VIEWER,
      allowedMethods: AllowedMethods.ALLOW_ALL,
      viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      responseHeadersPolicy: responsePolicy,
      functionAssociations: authFunction
        ? [
            {
              function: authFunction,
              eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
            },
          ]
        : undefined,
    };
    return dmzBehavior;
  }

  private createApiCachePolicy(name: string, queryStrings?: string[], ttlSettings?: ttlSettings): cloudfront.ICachePolicy {
    return new CachePolicy(this, name, {
      cachePolicyName: name,
      queryStringBehavior: queryStrings ? cloudfront.CacheQueryStringBehavior.allowList(...queryStrings) : undefined,
      headerBehavior: cloudfront.CacheHeaderBehavior.none(),
      cookieBehavior: cloudfront.CacheCookieBehavior.none(),
      defaultTtl: ttlSettings?.defaultTtl ? ttlSettings.defaultTtl : Duration.seconds(0), // default to no cache in absence of cache-control: max-age
      minTtl: ttlSettings?.minTtl ? ttlSettings.minTtl : Duration.seconds(0), // otherwise respect the header: cache-control: max-age
      maxTtl: ttlSettings?.maxTtl ? ttlSettings.maxTtl : Duration.seconds(3600),
      enableAcceptEncodingBrotli: true,
      enableAcceptEncodingGzip: true,
    });
  }
}

// check below link for more information on how cache-control header and cloudfront cache ttls work together
// https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Expiration.html#ExpirationDownloadDist
type ttlSettings = {
  defaultTtl: Duration;
  minTtl: Duration;
  maxTtl: Duration;
};
