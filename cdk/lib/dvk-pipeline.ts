import * as cdk from 'aws-cdk-lib';
import { CfnOutput, SecretValue, Stack } from 'aws-cdk-lib';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { BuildEnvironmentVariableType, ComputeType, LinuxBuildImage } from 'aws-cdk-lib/aws-codebuild';
import { Repository } from 'aws-cdk-lib/aws-ecr';
import { GitHubTrigger } from 'aws-cdk-lib/aws-codepipeline-actions';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';

interface DvkPipelineProps {
  env: string;
}

export class DvkPipeline extends Construct {
  constructor(scope: Stack, id: string, props: DvkPipelineProps) {
    super(scope, id);

    const account = cdk.Stack.of(this).account;

    const pipeline = new codepipeline.Pipeline(this, 'DvkPipeline', {
      crossAccountKeys: false,
    });
    const sourceOutput = new codepipeline.Artifact();
    const sourceAction = new cdk.aws_codepipeline_actions.GitHubSourceAction({
      actionName: 'GitHub_Source',
      owner: 'finnishtransportagency',
      repo: 'dvk',
      oauthToken: SecretValue.secretsManager('dev/dvk/github'),
      output: sourceOutput,
      branch: this.getBranch(props.env),
      trigger: GitHubTrigger.NONE,
    });

    pipeline.addStage({
      stageName: 'Source',
      actions: [sourceAction],
    });
    const importedAppSyncAPIKey = cdk.Fn.importValue('AppSyncAPIKey' + props.env);
    // Create the build project for DVK app
    const dvkBuildProject = new codebuild.PipelineProject(this, 'DvkBuild', {
      environment: {
        buildImage: LinuxBuildImage.fromEcrRepository(Repository.fromRepositoryName(this, 'DvkBuildImage', 'dvk-buildimage'), '1.0.1'),
        environmentVariables: {
          REACT_APP_API_KEY: { value: importedAppSyncAPIKey },
          REACT_APP_BG_MAP_API_KEY: {
            type: BuildEnvironmentVariableType.SECRETS_MANAGER,
            value: 'BGMapApiKey',
          },
        },
      },
      buildSpec: codebuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          install: {
            commands: ['echo Show node versions', 'node -v', 'npm -v'],
          },
          build: {
            commands: ['echo build dvk app', 'npm ci', 'npm run generate', 'npm run build'],
          },
        },
        artifacts: {
          'base-directory': 'build',
          files: '**/*',
        },
      }),
    });

    dvkBuildProject.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['secretsmanager:GetSecretValue'],
        resources: ['arn:aws:secretsmanager:eu-west-1:012525309247:secret:BGMapApiKey-AiplDl'],
      })
    );

    const buildOutput = new codepipeline.Artifact();

    pipeline.addStage({
      stageName: 'Build',
      actions: [
        new cdk.aws_codepipeline_actions.CodeBuildAction({
          actionName: 'BuildDvkApp',
          project: dvkBuildProject,
          input: sourceOutput,
          outputs: [buildOutput],
        }),
      ],
    });

    const importedDistributionId = cdk.Fn.importValue('SquatDistribution' + props.env);

    // Create the build project that will invalidate the cache
    const invalidateBuildProject = new codebuild.PipelineProject(this, 'InvalidateProject', {
      buildSpec: codebuild.BuildSpec.fromObject({
        version: '0.2',
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
        actions: ['cloudfront:CreateInvalidation'],
      })
    );

    const dvkCdkProject = new codebuild.PipelineProject(this, 'DvkCdkBuild', {
      environment: {
        buildImage: LinuxBuildImage.fromEcrRepository(Repository.fromRepositoryName(this, 'DvkCdkBuildImage', 'dvk-buildimage'), '1.0.1'),
        computeType: ComputeType.MEDIUM,
        environmentVariables: {
          ENVIRONMENT: { value: props.env },
        },
      },
      buildSpec: codebuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          install: {
            commands: ['echo Show node versions', 'node -v', 'npm -v'],
          },
          build: {
            commands: ['echo deploy cdk stack', 'cd cdk', 'npm ci', 'npm run generate', 'npm run cdk deploy DvkBackendStack'],
          },
        },
      }),
    });
    dvkCdkProject.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['cloudformation:*', 'ssm:*', 'secretsmanager:GetSecretValue', 's3:*', 'sts:*'],
        resources: ['*'],
      })
    );

    const importedBucketValue = cdk.Fn.importValue('DVKBucket' + props.env);

    pipeline.addStage({
      stageName: 'Deploy',
      actions: [
        new cdk.aws_codepipeline_actions.CodeBuildAction({
          actionName: 'CdkDeploy',
          project: dvkCdkProject,
          input: sourceOutput,
        }),
        new cdk.aws_codepipeline_actions.S3DeployAction({
          actionName: 'S3Deploy',
          bucket: s3.Bucket.fromBucketName(this, 'Bucket', importedBucketValue.toString()),
          input: buildOutput,
          runOrder: 1,
        }),
        new cdk.aws_codepipeline_actions.CodeBuildAction({
          actionName: 'InvalidateCache',
          project: invalidateBuildProject,
          input: buildOutput,
          runOrder: 2,
        }),
      ],
    });

    new CfnOutput(this, 'PipelineName', {
      value: pipeline.pipelineName,
      description: 'DVK pipeline name',
      exportName: 'DvkPipeline-' + props.env,
    });

    new CfnOutput(this, 'PipelineARN', {
      value: pipeline.pipelineArn,
      description: 'DVK pipeline ARN',
      exportName: 'DvkPipeline-ARN-' + props.env,
    });
  }

  private getBranch(env: string): string {
    switch (env) {
      case 'prod':
        return 'prod';
      case 'test':
        return 'test';
      default:
        return 'main';
    }
  }
}
