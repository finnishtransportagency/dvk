import * as cdk from "aws-cdk-lib";
import { CfnOutput, SecretValue, Stack } from "aws-cdk-lib";
import * as codepipeline from "aws-cdk-lib/aws-codepipeline";
import * as codebuild from "aws-cdk-lib/aws-codebuild";
import * as iam from "aws-cdk-lib/aws-iam";
import * as s3 from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import { LinuxBuildImage } from "aws-cdk-lib/aws-codebuild";
import { Repository } from "aws-cdk-lib/aws-ecr";
import { GitHubTrigger } from "aws-cdk-lib/aws-codepipeline-actions";
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
      branch: this.getBranch(props.env),
      trigger: GitHubTrigger.NONE,
    });

    const sourceStage = pipeline.addStage({
      stageName: "Source",
      actions: [sourceAction],
    });

    // Create the build project for Squat app
    const squatBuildProject = new codebuild.PipelineProject(this, "SquatBuild", {
      environment: {
        buildImage: LinuxBuildImage.fromEcrRepository(
          Repository.fromRepositoryName(this, "DvkBuildImage", "dvk-buildimage"),
          "1.0.0"
        ),
      },
      buildSpec: codebuild.BuildSpec.fromObject({
        version: "0.2",
        env: {
          variables: {
            CODEBUILD_SRC_DIR: "/squat",
          },
        },
        phases: {
          install: {
            commands: ["echo Show node versions", "node -v", "npm -v"],
          },
          build: {
            commands: ["echo build squat app", "cd squat", "npm ci", "npm run build"],
          },
        },
        artifacts: {
          "base-directory": "squat/build",
          files: "**/*",
        },
      }),
    });

    const buildOutput = new codepipeline.Artifact();

    const buildStage = pipeline.addStage({
      stageName: "Build",
      actions: [
        new cdk.aws_codepipeline_actions.CodeBuildAction({
          actionName: "BuildSquatApp",
          project: squatBuildProject,
          input: sourceOutput,
          outputs: [buildOutput],
        }),
      ],
    });

    const importedDistributionId = cdk.Fn.importValue("SquatDistribution" + props.env);

    // Create the build project that will invalidate the cache
    const invalidateBuildProject = new codebuild.PipelineProject(this, "InvalidateProject", {
      buildSpec: codebuild.BuildSpec.fromObject({
        version: "0.2",
        phases: {
          build: {
            commands: [
              // eslint-disable-next-line no-template-curly-in-string
              'aws cloudfront create-invalidation --distribution-id ${CLOUDFRONT_ID} --paths "/*"',
            ],
          },
        },
      }),
      environmentVariables: {
        CLOUDFRONT_ID: { value: importedDistributionId },
      },
    });

    // Add Cloudfront invalidation permissions to the project
    const distributionArn = `arn:aws:cloudfront::${account}:distribution/${importedDistributionId}`;

    invalidateBuildProject.addToRolePolicy(
      new iam.PolicyStatement({
        resources: [distributionArn],
        actions: ["cloudfront:CreateInvalidation"],
      })
    );

    const importedBucketValue = cdk.Fn.importValue("SquatBucket" + props.env);

    const deployStage = pipeline.addStage({
      stageName: "Deploy",
      actions: [
        new cdk.aws_codepipeline_actions.S3DeployAction({
          actionName: "S3Deploy",
          bucket: s3.Bucket.fromBucketName(this, "Bucket", importedBucketValue.toString()),
          input: buildOutput,
          runOrder: 1,
        }),
        new cdk.aws_codepipeline_actions.CodeBuildAction({
          actionName: "InvalidateCache",
          project: invalidateBuildProject,
          input: buildOutput,
          runOrder: 2,
        }),
      ],
    });

    new CfnOutput(this, "PipelineName", {
      value: pipeline.pipelineName,
      description: "Squat pipeline name",
      exportName: "SquatPipeline-" + props.env,
    });
  }

  private getBranch(env: string): string {
    switch (env) {
      case "prod":
        return "prod";
      case "test":
        return "test";
      default:
        return "main";
    }
  }
}
