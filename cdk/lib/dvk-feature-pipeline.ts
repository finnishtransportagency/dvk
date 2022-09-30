import {
  Artifacts,
  BuildSpec,
  Cache,
  ComputeType,
  GitHubSourceProps,
  LinuxBuildImage,
  LocalCacheMode,
  Project,
  Source,
} from 'aws-cdk-lib/aws-codebuild';
import { Repository } from 'aws-cdk-lib/aws-ecr';
import { Duration, Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { BlockPublicAccess, Bucket, BucketEncryption } from 'aws-cdk-lib/aws-s3';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import Config from './config';

export class DvkFeaturePipelineStackTest extends Stack {
  constructor(scope: Construct, id: string) {
    super(scope, id, { stackName: 'DvkFeaturePipelineStackTest' });
    const featureBucket = new Bucket(this, 'FeatureBucket', {
      bucketName: 'dvkfeaturetest2.testivaylapilvi.fi',
      publicReadAccess: false,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      encryption: BucketEncryption.S3_MANAGED,
      lifecycleRules: [{ expiration: Duration.days(30) }],
    });
    /*const sourceProps: GitHubSourceProps = {
      owner: 'finnishtransportagency',
      repo: 'dvk',
      reportBuildStatus: true,
      webhookFilters: [FilterGroup.inEventOf(EventAction.PULL_REQUEST_CREATED, EventAction.PULL_REQUEST_UPDATED)],
    };*/
    const sourceProps: GitHubSourceProps = {
      owner: 'finnishtransportagency',
      repo: 'dvk',
      branchOrRef: 'DVK-196',
    };
    const gitHubSource = Source.gitHub(sourceProps);
    const project = new Project(this, 'DvkTest2', {
      projectName: 'DvkFeatureTest2',
      concurrentBuildLimit: 1,
      buildSpec: BuildSpec.fromObject({
        version: '0.2',
        phases: {
          build: {
            commands: [
              'npm ci && npm run generate',
              'cd cdk && npm ci && npm run generate && cd ..',
              'npm run lint',
              'npm run test -- --coverage --reporters=jest-junit --passWithNoTests',
              'cd squat && npm ci',
              'npm run lint',
              'npm run test -- --coverage --reporters=jest-junit',
              'npm run build',
              'npx serve -s build &',
              'until curl -s http://localhost:3000 > /dev/null; do sleep 1; done',
              'cd ../test',
              'pip3 install --user --no-cache-dir -r requirements.txt',
              'xvfb-run --server-args="-screen 0 1920x1080x24 -ac" robot -v BROWSER:chrome --outputdir report/squat --xunit xunit.xml squat.robot',
              'kill %1',
              'cd ../cdk && npm run cdk deploy DvkBackendStack -- --require-approval never',
              'npm run datasync -- --dbonly',
              'npm run setup',
              'cd .. && npm run build && npx serve -s build &',
              'until curl -s http://localhost:3000 > /dev/null; do sleep 1; done',
              'cd test',
              'xvfb-run --server-args="-screen 0 1920x1080x24 -ac" robot -v BROWSER:chrome --outputdir report/dvk --xunit xunit.xml dvk',
            ],
            finally: ['cd cdk && npm run cdk destroy DvkBackendStack -- --force'],
          },
        },
        cache: { paths: ['/opt/robotframework/temp/.npm/**/*'] },
        reports: {
          'dvk-tests': { files: 'junit.xml' },
          'dvk-coverage': { files: 'coverage/clover.xml', 'file-format': 'CLOVERXML' },
          'squat-tests': { files: 'squat/junit.xml' },
          'squat-coverage': { files: 'squat/coverage/clover.xml', 'file-format': 'CLOVERXML' },
          'robot-tests': { files: 'test/report/xunit.xml' },
        },
        artifacts: {
          'base-directory': 'test/report',
          files: '**/*',
          name: '$CODEBUILD_BUILD_NUMBER',
        },
      }),
      source: gitHubSource,
      cache: Cache.local(LocalCacheMode.CUSTOM, LocalCacheMode.SOURCE, LocalCacheMode.DOCKER_LAYER),
      environment: {
        buildImage: LinuxBuildImage.fromEcrRepository(Repository.fromRepositoryName(this, 'DvkRobotImage', 'dvk-robotimage'), '1.0.0'),
        privileged: true,
        computeType: ComputeType.MEDIUM,
        environmentVariables: {
          CI: { value: true },
          ENVIRONMENT: { value: 'feature' },
        },
      },
      grantReportGroupPermissions: true,
      badge: true,
      artifacts: Artifacts.s3({
        bucket: featureBucket,
        includeBuildId: false,
        packageZip: false,
      }),
    });
    project.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['s3:*'],
        resources: [featureBucket.bucketArn],
      })
    );
    project.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['cloudformation:*', 'ssm:GetParametersByPath', 'secretsmanager:ListSecrets', 'secretsmanager:GetSecretValue', 'sts:*'],
        resources: ['*'],
      })
    );
    const table = Table.fromTableName(this, 'FairwayCardTable', Config.getFairwayCardTableName());
    project.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['dynamodb:PutObject'],
        resources: [table.tableArn],
      })
    );
  }
}
