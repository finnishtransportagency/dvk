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
  OriginProtocolPolicy,
  OriginRequestPolicy,
  OriginSslPolicy,
  ResponseHeadersPolicy,
  ViewerProtocolPolicy,
} from 'aws-cdk-lib/aws-cloudfront';
import { HttpOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';
import Config from './config';
import * as fs from 'fs';

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

    new CfnOutput(this, 'Site', { value: 'https://' + siteDomain });

    // Squat bucket
    const squatBucket = new s3.Bucket(this, 'SiteBucket', {
      bucketName: `squat.${siteDomain}`,
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    // Grant access to cloudfront
    squatBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        actions: ['s3:GetObject'],
        resources: [squatBucket.arnForObjects('*')],
        principals: [new iam.CanonicalUserPrincipal(cloudfrontOAI.cloudFrontOriginAccessIdentityS3CanonicalUserId)],
      })
    );
    new CfnOutput(this, 'Bucket', {
      value: squatBucket.bucketName,
      description: 'The name of Squat app S3',
      exportName: 'SquatBucket' + props.env,
    });

    const dvkBucket = new s3.Bucket(this, 'DVKBucket', {
      bucketName: `dvk.${siteDomain}`,
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });
    dvkBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        actions: ['s3:GetObject'],
        resources: [dvkBucket.arnForObjects('*')],
        principals: [new iam.CanonicalUserPrincipal(cloudfrontOAI.cloudFrontOriginAccessIdentityS3CanonicalUserId)],
      })
    );
    new CfnOutput(this, 'DVK Bucket name', {
      value: dvkBucket.bucketName,
      description: 'The name of DVK app S3',
      exportName: 'DVKBucket' + props.env,
    });

    // TLS certificate
    let certificate, domainNames;
    if (props.cloudfrontCertificateArn) {
      certificate = acm.Certificate.fromCertificateArn(this, 'certificate', props.cloudfrontCertificateArn);
      domainNames = [siteDomain];
      new CfnOutput(this, 'Certificate', { value: certificate.certificateArn });
    }

    // Cloudfront function suorittamaan basic autentikaatiota
    const basicUserName = config.getStringParameter('BasicUsername');
    const basicPassword = config.getStringParameter('BasicPassword');
    const authString = cdk.Fn.base64(basicUserName + ':' + basicPassword);

    const authSourceCode = fs.readFileSync(`${__dirname}/lambda/auth/authFunction.js`).toString('UTF-8');
    const authFunctionCode = cdk.Fn.sub(authSourceCode, {
      AUTH_STRING: authString,
    });

    const authFunction = new cloudfront.Function(this, 'DvkAuthFunction' + props.env, {
      code: cloudfront.FunctionCode.fromInline(authFunctionCode),
    });

    // Cloudfront function reitittamaan squat pyyntoja sovelluksen juureen
    // Nyt myos auth koodi upotettuna
    const routerSourceCode = fs.readFileSync(`${__dirname}/lambda/router/squatRequestRouter.js`).toString('UTF-8');
    const routerFunctionCode = cdk.Fn.sub(routerSourceCode, {
      AUTH_STRING: authString,
    });

    const cfFunction = new cloudfront.Function(this, 'SquatRouterFunction' + props.env, {
      code: cloudfront.FunctionCode.fromInline(routerFunctionCode),
    });

    const squatBehavior: BehaviorOptions = {
      origin: new cloudfront_origins.S3Origin(squatBucket, { originAccessIdentity: cloudfrontOAI }),
      compress: true,
      allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
      viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      functionAssociations: [
        {
          function: cfFunction,
          eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
        },
      ],
    };
    const dvkBehavior = {
      origin: new cloudfront_origins.S3Origin(dvkBucket, { originAccessIdentity: cloudfrontOAI }),
      compress: true,
      allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
      viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      functionAssociations: [
        {
          function: authFunction,
          eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
        },
      ],
    };

    const importedLoadBalancerDnsName = cdk.Fn.importValue('LoadBalancerDnsName' + props.env);
    const importedAppSyncAPIURL = cdk.Fn.importValue('AppSyncAPIURL' + props.env);
    const importedAppSyncAPIKey = cdk.Fn.importValue('AppSyncAPIKey' + props.env);
    const proxyUrl = config.getStringParameter('DMZProxyEndpoint');
    const corsResponsePolicy = new cloudfront.ResponseHeadersPolicy(this, 'CORSResponsePolicy', {
      responseHeadersPolicyName: 'CORSResponsePolicy' + props.env,
      corsBehavior: {
        accessControlAllowCredentials: false,
        accessControlAllowMethods: ['ALL'],
        accessControlAllowOrigins: ['*'],
        accessControlAllowHeaders: ['*'],
        originOverride: false,
        accessControlMaxAge: Duration.seconds(600),
      },
    });
    const proxyBehavior = this.createProxyBehavior(proxyUrl);
    const apiProxyBehavior = this.useHAProxy() ? proxyBehavior : this.createProxyBehavior(importedLoadBalancerDnsName, false);
    const graphqlProxyBehavior = this.useHAProxy()
      ? proxyBehavior
      : this.createProxyBehavior(cdk.Fn.parseDomainName(importedAppSyncAPIURL), true, corsResponsePolicy, { 'x-api-key': importedAppSyncAPIKey });
    const additionalBehaviors: Record<string, BehaviorOptions> = {
      'squat/*': squatBehavior,
      '/graphql': graphqlProxyBehavior,
      '/api/*': apiProxyBehavior,
    };
    // CloudFront distribution
    const distribution = new cloudfront.Distribution(this, 'SiteDistribution', {
      certificate,
      defaultRootObject: 'index.html',
      domainNames,
      minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
      additionalBehaviors,
      defaultBehavior: dvkBehavior,
    });

    new CfnOutput(this, 'DistributionId', {
      value: distribution.distributionId,
      description: 'Squat distribution name',
      exportName: 'SquatDistribution' + props.env,
    });
  }

  private useHAProxy(): boolean {
    // TODO: return true for permanent environments once proxy routing working
    return false;
  }

  private createProxyBehavior(
    domainName: string,
    useSSL = true,
    corsResponsePolicy: ResponseHeadersPolicy | undefined = undefined,
    customHeaders: Record<string, string> | undefined = undefined
  ) {
    const dmzBehavior: BehaviorOptions = {
      compress: true,
      origin: new HttpOrigin(domainName, {
        originSslProtocols: [OriginSslPolicy.TLS_V1_2, OriginSslPolicy.TLS_V1_2, OriginSslPolicy.TLS_V1, OriginSslPolicy.SSL_V3],
        protocolPolicy: useSSL ? OriginProtocolPolicy.HTTPS_ONLY : OriginProtocolPolicy.HTTP_ONLY,
        customHeaders,
      }),
      cachePolicy: CachePolicy.CACHING_DISABLED,
      originRequestPolicy: corsResponsePolicy ? OriginRequestPolicy.CORS_CUSTOM_ORIGIN : OriginRequestPolicy.ALL_VIEWER,
      allowedMethods: AllowedMethods.ALLOW_ALL,
      viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      responseHeadersPolicy: corsResponsePolicy,
    };
    return dmzBehavior;
  }
}
