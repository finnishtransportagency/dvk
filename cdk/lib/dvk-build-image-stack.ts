import { Stack, StackProps, SecretValue, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import { LinuxBuildImage } from 'aws-cdk-lib/aws-codebuild';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { GitHubTrigger } from 'aws-cdk-lib/aws-codepipeline-actions';

export class DvkBuildImageStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    const imageRepoName = 'dvk-buildimage';
    new cdk.aws_ecr.Repository(this, 'BuildImageRepository', {
      repositoryName: imageRepoName,
    });
    const robotImageRepoName = 'dvk-robotimage';
    new cdk.aws_ecr.Repository(this, 'RobotBuildImageRepository', {
      repositoryName: robotImageRepoName,
    });
    const pipeline = new codepipeline.Pipeline(this, 'BuildImagePipeline', {
      crossAccountKeys: false,
    });
    const sourceOutput = new codepipeline.Artifact();
    const sourceAction = new cdk.aws_codepipeline_actions.GitHubSourceAction({
      actionName: 'GitHub_Source',
      owner: 'finnishtransportagency',
      repo: 'dvk',
      oauthToken: SecretValue.secretsManager('dev/dvk/github'),
      output: sourceOutput,
      branch: 'main',
      trigger: GitHubTrigger.NONE,
    });

    pipeline.addStage({
      stageName: 'Source',
      actions: [sourceAction],
    });
    const account = cdk.Stack.of(this).account;
    const buildProject = this.buildProject(account, imageRepoName, '1.0.2', '.', 'ImageBuild');
    const robotBuildProject = this.buildProject(account, robotImageRepoName, '1.0.0', 'test', 'RobotImageBuild');
    pipeline.addStage({
      stageName: 'Build',
      actions: [
        new cdk.aws_codepipeline_actions.CodeBuildAction({
          actionName: 'BuildDVKImage',
          project: buildProject,
          input: sourceOutput,
        }),
        new cdk.aws_codepipeline_actions.CodeBuildAction({
          actionName: 'BuildRobotImage',
          project: robotBuildProject,
          input: sourceOutput,
        }),
      ],
    });

    new CfnOutput(this, 'PipelineName', {
      value: pipeline.pipelineName,
      description: 'Project buildimage pipeline name',
      exportName: 'BuildimagePipeline',
    });
  }

  private buildProject(
    account: string,
    imageRepoName: string,
    version: string,
    dockerFileDirectory: string,
    name: string
  ): codebuild.PipelineProject {
    const buildProject = new codebuild.PipelineProject(this, name, {
      environment: {
        buildImage: LinuxBuildImage.STANDARD_5_0,
        privileged: true,
      },
      environmentVariables: {
        AWS_DEFAULT_REGION: { value: 'eu-west-1' },
        AWS_ACCOUNT_ID: { value: account },
        IMAGE_REPO_NAME: { value: imageRepoName },
        IMAGE_TAG: { value: version },
        DOCKERFILE_DIR: { value: dockerFileDirectory },
      },
      buildSpec: codebuild.BuildSpec.fromSourceFilename('./cdk/lib/image-buildspec.yml'),
    });
    buildProject.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          'ecr:BatchCheckLayerAvailability',
          'ecr:CompleteLayerUpload',
          'ecr:GetAuthorizationToken',
          'ecr:InitiateLayerUpload',
          'ecr:PutImage',
          'ecr:UploadLayerPart',
        ],
        resources: ['*'],
      })
    );
    return buildProject;
  }
}
