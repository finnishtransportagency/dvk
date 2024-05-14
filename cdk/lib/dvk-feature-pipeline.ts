import {
  BuildEnvironmentVariableType,
  BuildSpec,
  Cache,
  ComputeType,
  EventAction,
  FilterGroup,
  GitHubSourceProps,
  LinuxBuildImage,
  LocalCacheMode,
  Project,
  Source,
} from 'aws-cdk-lib/aws-codebuild';
import { Repository } from 'aws-cdk-lib/aws-ecr';
import { Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import Config from './config';

export class DvkFeaturePipelineStack extends Stack {
  constructor(scope: Construct, id: string) {
    super(scope, id, {
      stackName: 'DvkFeaturePipelineStack',
      env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: 'eu-west-1',
      },
    });
    const config = new Config(this);
    const sourceProps: GitHubSourceProps = {
      owner: 'finnishtransportagency',
      repo: 'dvk',
      reportBuildStatus: true,
      webhookFilters: [
        FilterGroup.inEventOf(EventAction.PULL_REQUEST_CREATED, EventAction.PULL_REQUEST_UPDATED).andActorAccountIs(
          config.getGlobalStringParameter('FeaturePipelineActorPattern')
        ),
      ],
    };
    const gitHubSource = Source.gitHub(sourceProps);
    new Project(this, 'DvkTest', {
      projectName: 'DvkFeatureTest',
      buildSpec: BuildSpec.fromObject({
        version: '0.2',
        phases: {
          build: {
            commands: [
              'cd squat',
              'npm ci',
              'npm run lint',
              'npm run test -- --coverage',
              'npm run build',
              'cd ..',
              'npm ci',
              'npm run generate',
              'cd cdk',
              'npm ci',
              'npm run generate',
              'npm run test -- --coverage --reporters=jest-junit',
              'cd ..',
              'npm run lint',
              'npm run test -- --coverage',
              'npm run build',
              'cd admin',
              'npm ci',
              'npm run generate',
              'npm run lint',
              'npm run test -- --coverage',
              'npm run build',
            ],
          },
        },
        cache: { paths: ['/root/.cache/**/*', '/root/.npm/**/*'] },
        reports: {
          'dvk-tests': { files: 'junit.xml' },
          'dvk-coverage': { files: 'coverage/clover.xml', 'file-format': 'CLOVERXML' },
          'squat-tests': { files: 'squat/junit.xml' },
          'squat-coverage': { files: 'squat/coverage/clover.xml', 'file-format': 'CLOVERXML' },
          'admin-tests': { files: 'admin/junit.xml' },
          'admin-coverage': { files: 'admin/coverage/clover.xml', 'file-format': 'CLOVERXML' },
          'cdk-tests': { files: 'cdk/junit.xml' },
          'cdk-coverage': { files: 'cdk/coverage/clover.xml', 'file-format': 'CLOVERXML' },
        },
      }),
      source: gitHubSource,
      cache: Cache.local(LocalCacheMode.CUSTOM, LocalCacheMode.SOURCE, LocalCacheMode.DOCKER_LAYER),
      environment: {
        buildImage: LinuxBuildImage.fromEcrRepository(Repository.fromRepositoryName(this, 'DvkFeatureBuildImage', 'dvk-buildimage'), '1.0.6'),
        computeType: ComputeType.MEDIUM,
        environmentVariables: {
          CI: { value: true },
          NODE_OPTIONS: {
            value: '--max_old_space_size=4096 --max-old-space-size=4096',
            type: BuildEnvironmentVariableType.PLAINTEXT,
          },
        },
      },
      grantReportGroupPermissions: true,
      badge: true,
    });
  }
}
