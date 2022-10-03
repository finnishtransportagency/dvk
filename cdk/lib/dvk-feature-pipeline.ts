import {
  Artifacts,
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
import { Duration, Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { BlockPublicAccess, Bucket, BucketEncryption } from 'aws-cdk-lib/aws-s3';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import Config from './config';

export class DvkFeaturePipelineStack extends Stack {
  constructor(scope: Construct, id: string) {
    super(scope, id, { stackName: 'DvkFeaturePipelineStack' });
    const featureBucket = new Bucket(this, 'FeatureBucket', {
      bucketName: 'dvkfeaturetest.testivaylapilvi.fi',
      publicReadAccess: false,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      encryption: BucketEncryption.S3_MANAGED,
      lifecycleRules: [{ expiration: Duration.days(30) }],
    });
    const sourceProps: GitHubSourceProps = {
      owner: 'finnishtransportagency',
      repo: 'dvk',
      reportBuildStatus: true,
      webhookFilters: [
        FilterGroup.inEventOf(EventAction.PULL_REQUEST_CREATED, EventAction.PULL_REQUEST_UPDATED).andActorAccountIs(
          'hakalap|kettunju|hiisilaa|makinenr|karvoju|JuusoVirtaCGI'
        ),
      ],
    };
    const gitHubSource = Source.gitHub(sourceProps);
    const project = new Project(this, 'DvkTest', {
      projectName: 'DvkFeatureTest',
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
              'cd ../cdk',
              'export PUBLIC_IP=`npm run -s ip`',
              'npm run cdk deploy DvkBackendStack -- --require-approval never',
              'npm run datasync -- --dbonly',
              'npm run setup && cd ..',
              'npm run build && npx serve -p 3001 -s build &',
              'until curl -s http://localhost:3001 > /dev/null; do sleep 1; done',
              'cd test',
              'xvfb-run --server-args="-screen 0 1920x1080x24 -ac" robot -v BROWSER:chrome -v PORT:3001 --outputdir report/dvk --xunit xunit.xml dvk',
            ],
            finally: ['cd $CODEBUILD_SRC_DIR/cdk && npm run cdk destroy DvkBackendStack -- --force'],
          },
        },
        cache: { paths: ['/opt/robotframework/temp/.npm/**/*'] },
        reports: {
          'dvk-tests': { files: 'junit.xml' },
          'dvk-coverage': { files: 'coverage/clover.xml', 'file-format': 'CLOVERXML' },
          'squat-tests': { files: 'squat/junit.xml' },
          'squat-coverage': { files: 'squat/coverage/clover.xml', 'file-format': 'CLOVERXML' },
          'squat-robot-tests': { files: 'test/report/squat/xunit.xml' },
          'dvk-robot-tests': { files: 'test/report/dvk/xunit.xml' },
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
          REACT_APP_BG_MAP_API_KEY: {
            type: BuildEnvironmentVariableType.SECRETS_MANAGER,
            value: 'BGMapApiKey',
          },
          REACT_APP_BG_MAP_API_URL: {
            type: BuildEnvironmentVariableType.PARAMETER_STORE,
            value: 'BGMapApiUrl',
          },
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
        actions: ['cloudformation:*'],
        resources: [`arn:aws:cloudformation:eu-west-1:${this.account}:stack/DvkBackendStack-${Config.getEnvironment()}/*`],
      })
    );
    project.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['dynamodb:ListTables', 'sts:*'],
        resources: ['*'],
      })
    );
    const table = Table.fromTableName(this, 'FairwayCardTable', Config.getFairwayCardTableName());
    project.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['dynamodb:PutItem'],
        resources: [table.tableArn],
      })
    );
  }
}
