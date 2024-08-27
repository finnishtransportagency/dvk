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
import Config from './config';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { BlockPublicAccess, Bucket, BucketEncryption } from 'aws-cdk-lib/aws-s3';
import { Vpc } from 'aws-cdk-lib/aws-ec2';

export class DvkSonarPipelineStack extends Stack {
  constructor(scope: Construct, id: string) {
    super(scope, id, {
      stackName: 'DvkSonarPipelineStack',
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
      webhookFilters: [FilterGroup.inEventOf(EventAction.PUSH).andBranchIs('main')],
    };
    const sonarBucket = new Bucket(this, 'SonarBucket', {
      bucketName: 'dvksonar.testivaylapilvi.fi',
      publicReadAccess: false,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      encryption: BucketEncryption.S3_MANAGED,
      lifecycleRules: [{ expiration: Duration.days(14) }],
    });
    const vpc = Vpc.fromLookup(this, 'DvkVPC', { vpcName: 'DvkTest-VPC' });
    const gitHubSource = Source.gitHub(sourceProps);
    const project = new Project(this, 'DvkSonarQube', {
      projectName: 'DvkSonarQube',
      vpc,
      concurrentBuildLimit: 1,
      buildSpec: BuildSpec.fromObject({
        version: '0.2',
        phases: {
          build: {
            commands: [
              'cd squat',
              'npm ci',
              'npm run buildlib',
              'npm run lint',
              'npm run test -- --coverage',
              'cd ..',
              'npm ci',
              'npm run generate',
              'cd cdk',
              'npm ci',
              'npm run generate',
              'npm run test -- --coverage --reporters=jest-sonar',
              'cd ..',
              'npm run lint',
              'npm run test -- --coverage',
              'cd admin',
              'npm ci',
              'npm run generate',
              'npm run lint',
              'npm run test -- --coverage',
              'cd ..',
              'export DVK_VERSION=`node -p "require(\'./package.json\').version"`',
              'sed -i "s/file path=\\"/file path=\\"squat\\//g" squat/coverage/sonar-report.xml',
              'sed -i "s/file path=\\"/file path=\\"admin\\//g" admin/coverage/sonar-report.xml',
              'sed -i "s/file path=\\"/file path=\\"cdk\\//g" cdk/coverage/sonar-report.xml',
              `npx sonarqube-scanner -Dsonar.host.url=$SONARQUBE_HOST_URL -Dsonar.token=$SONARQUBE_ACCESS_TOKEN -Dsonar.projectKey=DVK-main -Dsonar.projectVersion=$DVK_VERSION`,
              'cd cdk',
              'npm run cdk deploy DvkBackendStack -- --require-approval never',
              'npm run datasync -- --reset',
              'npm run setup',
              'cd ..',
              'cd squat',
              'npm run build',
              'npx serve -s build &',
              'until curl -s http://localhost:3000 > /dev/null; do sleep 1; done',
              'cd ../test',
              'pip3 install --user --no-cache-dir -r requirements.txt',
              'xvfb-run --server-args="-screen 0 1920x1080x24 -ac" robot -v BROWSER:chrome --outputdir report/squat --xunit xunit.xml squat.robot',
              'cd ..',
              'npm run build',
              'npx serve -p 3001 -s build &',
              'until curl -s http://localhost:3001 > /dev/null; do sleep 1; done',
              'cd test',
              'xvfb-run --server-args="-screen 0 1920x1080x24 -ac" robot -v BROWSER:chrome -v PORT:3001 --outputdir report/dvk --xunit xunit.xml dvk',
              'cd ..',
              'cd admin',
              'npm run build',
              'npx serve -p 3002 -s build &',
              'until curl -s http://localhost:3002 > /dev/null; do sleep 1; done',
              'cd ../test',
              'xvfb-run --server-args="-screen 0 1920x1080x24 -ac" robot -v BROWSER:chrome -v PORT:3002 --outputdir report/admin --xunit xunit.xml admin',
            ],
          },
        },
        cache: { paths: ['/opt/robotframework/temp/.npm/**/*', '/opt/robotframework/temp/.sonar/**/*'] },
        reports: {
          'squat-robot-tests': { files: 'test/report/squat/xunit.xml' },
          'dvk-robot-tests': { files: 'test/report/dvk/xunit.xml' },
          'admin-robot-tests': { files: 'test/report/admin/xunit.xml' },
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
        buildImage: LinuxBuildImage.fromEcrRepository(Repository.fromRepositoryName(this, 'DvkRobotImage', 'dvk-robotimage'), '1.0.4'),
        computeType: ComputeType.MEDIUM,
        environmentVariables: {
          CI: { value: true },
          ENVIRONMENT: { value: 'feature' },
          SONARQUBE_HOST_URL: { value: config.getGlobalStringParameter('SonarQubeHostURL') },
          SONARQUBE_ACCESS_TOKEN: {
            type: BuildEnvironmentVariableType.SECRETS_MANAGER,
            value: 'SonarQubeAccessToken',
          },
          NODE_OPTIONS: {
            value: '--max_old_space_size=4096 --max-old-space-size=4096',
            type: BuildEnvironmentVariableType.PLAINTEXT,
          },
        },
      },
      grantReportGroupPermissions: true,
      badge: true,
      artifacts: Artifacts.s3({
        bucket: sonarBucket,
        includeBuildId: false,
        packageZip: false,
      }),
    });
    project.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['s3:*'],
        resources: [sonarBucket.bucketArn],
      })
    );
    project.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['cloudformation:*'],
        resources: [`arn:aws:cloudformation:eu-west-1:${this.account}:stack/DvkBackendStack-${Config.getEnvironment()}*`],
      })
    );
    project.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['dynamodb:ListTables', 'sts:*'],
        resources: ['*'],
      })
    );
    let table = Table.fromTableName(this, 'FairwayCardTable', Config.getFairwayCardWithVersionsTableName() + '*');
    project.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['dynamodb:PutItem', 'dynamodb:DeleteItem', 'dynamodb:Scan'],
        resources: [table.tableArn],
      })
    );
    table = Table.fromTableName(this, 'HarborTable', Config.getHarborWithVersionsTableName() + '*');
    project.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['dynamodb:PutItem', 'dynamodb:DeleteItem', 'dynamodb:Scan'],
        resources: [table.tableArn],
      })
    );
  }
}
