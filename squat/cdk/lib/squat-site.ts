import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as cloudfront_origins from "aws-cdk-lib/aws-cloudfront-origins";
import { CfnOutput, Duration, Stack } from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";

interface SquatSiteProps {
  domainName: string;
  siteSubDomain: string;
  cloudfrontCertificateArn?: string;
  env: string;
}

export class SquatSite extends Construct {
  constructor(parent: Stack, id: string, props: SquatSiteProps) {
    super(parent, id);

    const siteDomain = props.siteSubDomain + "." + props.domainName;
    const cloudfrontOAI = new cloudfront.OriginAccessIdentity(this, "cloudfront-OAI", {
      comment: `OAI for ${id}-${props.env}`,
    });

    new CfnOutput(this, "Site", { value: "https://" + siteDomain });

    // Content bucket
    const siteBucket = new s3.Bucket(this, "SiteBucket", {
      bucketName: siteDomain,
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    // Grant access to cloudfront
    siteBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        actions: ["s3:GetObject"],
        resources: [siteBucket.arnForObjects("*")],
        principals: [new iam.CanonicalUserPrincipal(cloudfrontOAI.cloudFrontOriginAccessIdentityS3CanonicalUserId)],
      })
    );
    new CfnOutput(this, "Bucket", {
      value: siteBucket.bucketName,
      description: "The name of Squat app S3",
      exportName: "SquatBucket" + props.env,
    });

    // TLS certificate
    //TODO kun saatu vaylapilvelta sertifikaatti:
    //const certificate = acm.Certificate.fromCertificateArn(this, "certificate", props.cloudfrontCertificateArn),
    // new CfnOutput(this, "Certificate", { value: certificate.certificateArn });

    // Sallitaan query stringit kieliversioiden bookmarkkaamista ajatelleen
    const requestPolicy = new cloudfront.OriginRequestPolicy(this, "SiteRequestPolicy", {
      originRequestPolicyName: "SquatPolicy" + props.env,
      comment: "Allow query strings",
      queryStringBehavior: cloudfront.OriginRequestQueryStringBehavior.all(),
    });

    // CloudFront distribution
    const distribution = new cloudfront.Distribution(this, "SiteDistribution", {
      //certificate: certificate,
      defaultRootObject: "index.html",
      // domainNames: [siteDomain],
      minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 403,
          responsePagePath: "/error.html",
          ttl: Duration.minutes(30),
        },
      ],
      defaultBehavior: {
        origin: new cloudfront_origins.S3Origin(siteBucket, { originAccessIdentity: cloudfrontOAI }),
        compress: true,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        originRequestPolicy: requestPolicy,
      },
    });

    new CfnOutput(this, "DistributionId", {
      value: distribution.distributionId,
      description: "Squat distribution name",
      exportName: "SquatDistribution" + props.env,
    });
  }
}
