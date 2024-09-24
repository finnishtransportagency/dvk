import * as cdk from 'aws-cdk-lib';
import { Arn, CfnOutput, SecretValue, Stack } from 'aws-cdk-lib';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { ComputeType, LinuxBuildImage } from 'aws-cdk-lib/aws-codebuild';
import { Repository } from 'aws-cdk-lib/aws-ecr';
import { GitHubTrigger } from 'aws-cdk-lib/aws-codepipeline-actions';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import Config from './config';

interface DvkPipelineProps {
  env: string;
}

export class DvkPipeline extends Construct {
  constructor(scope: Stack, id: string, props: DvkPipelineProps) {
    super(scope, id);

    const account = cdk.Stack.of(this).account;

    const pipeline = new codepipeline.Pipeline(this, 'DvkPipeline', {
      crossAccountKeys: false,
      pipelineType: codepipeline.PipelineType.V1,
      executionMode: codepipeline.ExecutionMode.SUPERSEDED,
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
        buildImage: LinuxBuildImage.fromEcrRepository(Repository.fromRepositoryName(this, 'DvkBuildImage', 'dvk-buildimage'), '1.0.6'),
        computeType: ComputeType.LARGE,
        environmentVariables: {
          VITE_APP_API_KEY: { value: importedAppSyncAPIKey },
          VITE_APP_USE_STATIC_FEATURES: { value: Config.isDeveloperEnvironment(props.env) },
          VITE_APP_ENV: { value: props.env },
          CI: { value: true },
          NODE_OPTIONS: {
            value: '--max_old_space_size=4096 --max-old-space-size=4096',
            type: codebuild.BuildEnvironmentVariableType.PLAINTEXT,
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
            commands: [
              'echo build dvk app',
              'cd squat',
              'npm ci',
              'npm run buildlib',
              'cd ..',
              'npm ci',
              'npm run generate',
              'BUILD_PATH=./build/vaylakortti PUBLIC_URL=/vaylakortti npm run build',
              'cp ./root/* ./build/',
            ],
          },
        },
        artifacts: {
          'base-directory': 'build',
          files: '**/*',
        },
      }),
    });

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
      environment: {
        buildImage: LinuxBuildImage.fromEcrRepository(Repository.fromRepositoryName(this, 'InvalidateBuildImage', 'dvk-buildimage'), '1.0.6'),
        computeType: ComputeType.SMALL,
      },
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
        buildImage: LinuxBuildImage.fromEcrRepository(Repository.fromRepositoryName(this, 'DvkCdkBuildImage', 'dvk-buildimage'), '1.0.6'),
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
            commands: [
              'echo deploy cdk stack',
              'cd cdk',
              'npm ci',
              'npm run generate',
              'npm run cdk deploy DvkBackendStack DvkUsEastStack SquatSiteStack DvkBackupServicesStack -- --require-approval never',
              'npm run deploy:stackpolicy:backend',
              'npm run deploy:stackpolicy:frontend',
            ],
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

    // Create the build project that will delete files from s3 before deploy
    const emptyS3BuildProject = new codebuild.PipelineProject(this, 'EmptyS3Project', {
      environment: {
        buildImage: LinuxBuildImage.fromEcrRepository(Repository.fromRepositoryName(this, 'S3BuildImage', 'dvk-buildimage'), '1.0.6'),
        computeType: ComputeType.SMALL,
      },
      buildSpec: codebuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          build: {
            commands: [
              // eslint-disable-next-line no-template-curly-in-string
              'aws s3 rm s3://${TARGET_BUCKET} --recursive',
            ],
          },
        },
      }),
      environmentVariables: {
        TARGET_BUCKET: { value: importedBucketValue },
      },
    });
    const s3RootArn = Arn.format({
      region: '',
      service: 's3',
      resource: importedBucketValue,
      account: '',
      partition: 'aws',
    });
    const s3FilesArn = Arn.format({
      region: '',
      service: 's3',
      resource: importedBucketValue,
      resourceName: '*',
      account: '',
      partition: 'aws',
    });

    emptyS3BuildProject.addToRolePolicy(
      new iam.PolicyStatement({
        resources: [s3RootArn],
        actions: ['s3:ListBucket', 's3:GetBucketLocation'],
        effect: Effect.ALLOW,
      })
    );
    emptyS3BuildProject.addToRolePolicy(
      new iam.PolicyStatement({
        resources: [s3FilesArn],
        actions: ['s3:GetObject', 's3:GetObjectAcl', 's3:DeleteObject'],
        effect: Effect.ALLOW,
      })
    );

    pipeline.addStage({
      stageName: 'Deploy',
      actions: [
        new cdk.aws_codepipeline_actions.CodeBuildAction({
          actionName: 'CdkDeploy',
          project: dvkCdkProject,
          input: sourceOutput,
          runOrder: 1,
        }),
        new cdk.aws_codepipeline_actions.CodeBuildAction({
          actionName: 'DeleteFiles',
          project: emptyS3BuildProject,
          input: buildOutput,
          runOrder: 2,
        }),
        new cdk.aws_codepipeline_actions.S3DeployAction({
          actionName: 'S3Deploy',
          bucket: s3.Bucket.fromBucketName(this, 'Bucket', importedBucketValue.toString()),
          input: buildOutput,
          runOrder: 3,
        }),
        new cdk.aws_codepipeline_actions.CodeBuildAction({
          actionName: 'InvalidateCache',
          project: invalidateBuildProject,
          input: buildOutput,
          runOrder: 4,
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
