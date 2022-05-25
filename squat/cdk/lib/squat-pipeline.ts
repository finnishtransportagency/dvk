import * as cdk from "aws-cdk-lib";
import { SecretValue, Stack } from "aws-cdk-lib";
import * as codepipeline from "aws-cdk-lib/aws-codepipeline";
import * as codebuild from "aws-cdk-lib/aws-codebuild";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as iam from "aws-cdk-lib/aws-iam";
import * as s3 from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
declare const distribution: cloudfront.Distribution;
interface SquatPipelineProps {
  env: string;
}
export class SquatPipeline extends Construct {
  constructor(scope: Stack, id: string, props: SquatPipelineProps) {
    super(scope, id);

    const account = cdk.Stack.of(this).account;

    const pipeline = new codepipeline.Pipeline(this, "SquatPipeline", {
      crossAccountKeys: false,
    });
    const sourceOutput = new codepipeline.Artifact();
    const sourceAction = new cdk.aws_codepipeline_actions.GitHubSourceAction({
      actionName: "GitHub_Source",
      owner: "finnishtransportagency",
      repo: "dvk",
      oauthToken: SecretValue.secretsManager("dev/dvk/github"),
      output: sourceOutput,
      branch: "main", //TODO: valita github webhook lambdalta event tiedot?
    });

    const sourceStage = pipeline.addStage({
      stageName: "Source",
      actions: [sourceAction],
    });

    const buildStage = pipeline.addStage({
      stageName: "Build",
      actions: [
        // optional property
        // see below...
      ],
    });

    // Create the build project that will invalidate the cache
    const invalidateBuildProject = new codebuild.PipelineProject(this, `InvalidateProject`, {
      buildSpec: codebuild.BuildSpec.fromObject({
        version: "0.2",
        phases: {
          build: {
            commands: [
              'aws cloudfront create-invalidation --distribution-id ${CLOUDFRONT_ID} --paths "/*"',
              // Choose whatever files or paths you'd like, or all files as specified here
            ],
          },
        },
      }),
      environmentVariables: {
        CLOUDFRONT_ID: { value: distribution.distributionId },
      },
    });

    // Add Cloudfront invalidation permissions to the project
    const distributionArn = `arn:aws:cloudfront::${account}:distribution/${distribution.distributionId}`;
    console.log("distribution ARN: ", distributionArn);
    invalidateBuildProject.addToRolePolicy(
      new iam.PolicyStatement({
        resources: [distributionArn],
        actions: ["cloudfront:CreateInvalidation"],
      })
    );

    const importedBucketValue = cdk.Fn.importValue("SquatBucket"); //TODO: import bucketin nimi ympariston mukaan

    const deployStage = pipeline.addStage({
      stageName: "Deploy",
      actions: [
        new cdk.aws_codepipeline_actions.S3DeployAction({
          actionName: "S3Deploy",
          bucket: s3.Bucket.fromBucketName(this, "Bucket", importedBucketValue.toString()),
          input: sourceOutput,
          runOrder: 1,
        }),
        new cdk.aws_codepipeline_actions.CodeBuildAction({
          actionName: "InvalidateCache",
          project: invalidateBuildProject,
          input: sourceOutput,
          runOrder: 2,
        }),
      ],
    });
  }
}
