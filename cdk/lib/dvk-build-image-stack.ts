import { Stack, StackProps, SecretValue } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cdk from "aws-cdk-lib";
import * as codepipeline from "aws-cdk-lib/aws-codepipeline";
import * as codebuild from "aws-cdk-lib/aws-codebuild";
import { LinuxBuildImage } from 'aws-cdk-lib/aws-codebuild';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';

export class DvkBuildImageStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    const pipeline = new codepipeline.Pipeline(this, "BuildImagePipeline", {
      crossAccountKeys: false,
    });
    const sourceOutput = new codepipeline.Artifact();
    const sourceAction = new cdk.aws_codepipeline_actions.GitHubSourceAction({
      actionName: "GitHub_Source",
      owner: "finnishtransportagency",
      repo: "dvk",
      oauthToken: SecretValue.secretsManager("dev/dvk/github"),
      output: sourceOutput,
      branch: "DVK-14",
    });

    pipeline.addStage({
      stageName: "Source",
      actions: [sourceAction],
    });

    const buildProject = new codebuild.PipelineProject(this, "ImageBuild", {
      environment: {
        buildImage: LinuxBuildImage.STANDARD_5_0,
        privileged: true,
      },
      environmentVariables: {
        "AWS_DEFAULT_REGION": { value: "eu-west-1" },
        "AWS_ACCOUNT_ID": { value: "012525309247" },
        "IMAGE_REPO_NAME": { value: "dvk-buildimage" },
        "IMAGE_TAG": { value: "1.0.0" },
      },
      buildSpec: codebuild.BuildSpec.fromSourceFilename("./cdk/lib/image-buildspec.yml"),
    })
    buildProject.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          /*"logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "s3:PutObject",
          "s3:GetObject",
          "s3:GetObjectVersion",
          "s3:GetBucketAcl",
          "s3:GetBucketLocation",
          "codebuild:CreateReportGroup",
          "codebuild:CreateReport",
          "codebuild:UpdateReport",
          "codebuild:BatchPutTestCases",
          "codebuild:BatchPutCodeCoverages",*/
          "ecr:BatchCheckLayerAvailability",
          "ecr:CompleteLayerUpload",
          "ecr:GetAuthorizationToken",
          "ecr:InitiateLayerUpload",
          "ecr:PutImage",
          "ecr:UploadLayerPart"
        ],
        resources: ["*"],
    }));

    pipeline.addStage({
      stageName: "Build",
      actions: [
        new cdk.aws_codepipeline_actions.CodeBuildAction({
          actionName: "BuildDVKImage",
          project: buildProject,
          input: sourceOutput,
        }),
      ],
    });
  }
}
