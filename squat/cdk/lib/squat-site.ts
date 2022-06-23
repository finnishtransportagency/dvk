import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as cloudfront_origins from 'aws-cdk-lib/aws-cloudfront-origins';
import { CfnOutput, Duration, Stack } from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import { BehaviorOptions } from 'aws-cdk-lib/aws-cloudfront';

interface SquatSiteProps {
  domainName: string;
  siteSubDomain: string;
  cloudfrontCertificateArn?: string;
  env: string;
}

export class SquatSite extends Construct {
  constructor(parent: Stack, id: string, props: SquatSiteProps) {
    super(parent, id);

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

    // Sallitaan query stringit kieliversioiden bookmarkkaamista ajatelleen
    const requestPolicy = new cloudfront.OriginRequestPolicy(this, 'SiteRequestPolicy', {
      originRequestPolicyName: 'SquatPolicy' + props.env,
      comment: 'Allow query strings',
      queryStringBehavior: cloudfront.OriginRequestQueryStringBehavior.all(),
    });
    const squatBehavior = {
      origin: new cloudfront_origins.S3Origin(squatBucket, { originAccessIdentity: cloudfrontOAI }),
      compress: true,
      allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
      viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      originRequestPolicy: requestPolicy,
    };
    const dvkBehavior = {
      origin: new cloudfront_origins.S3Origin(dvkBucket, { originAccessIdentity: cloudfrontOAI }),
      compress: true,
      allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
      viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      originRequestPolicy: requestPolicy,
    };
    const additionalBehaviors: Record<string, BehaviorOptions> = {
      '/squat/*': squatBehavior,
    };
    // CloudFront distribution
    const distribution = new cloudfront.Distribution(this, 'SiteDistribution', {
      certificate,
      defaultRootObject: 'index.html',
      domainNames,
      minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 403,
          responsePagePath: '/index.html',
          ttl: Duration.minutes(30),
        },
      ],
      additionalBehaviors,
      defaultBehavior: dvkBehavior,
    });

    new CfnOutput(this, 'DistributionId', {
      value: distribution.distributionId,
      description: 'Squat distribution name',
      exportName: 'SquatDistribution' + props.env,
    });
  }
}
