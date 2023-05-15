import * as cdk from 'aws-cdk-lib';
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
import Config from './config';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { BlockPublicAccess, Bucket, BucketEncryption } from 'aws-cdk-lib/aws-s3';
import { Rule, Schedule } from 'aws-cdk-lib/aws-events';
import { CodeBuildProject } from 'aws-cdk-lib/aws-events-targets';
export class DvkScheduledTestsPipelineStack extends Stack {
  constructor(scope: Construct, id: string) {
    super(scope, id, {
      env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: 'eu-west-1',
      },
      stackName: 'DvkScheduledTestsPipelineStack-' + Config.getEnvironment(),
      tags: Config.tags,
    });
    const env = Config.getEnvironment();
    const importedCertificateARN = cdk.Fn.importValue('DvkCertificateARN' + env); // Kehittajaymparistoista ei loydy certia, jolloin kaytetaan cloudfrontin dns-tietoa
    const importedSiteURL = cdk.Fn.importValue('DvkSiteUrl' + env);
    const importedCloudFrontURL = importedCertificateARN ? importedSiteURL : 'https://' + cdk.Fn.importValue('CloudFrontDomainName' + env);

    const sourceProps: GitHubSourceProps = {
      owner: 'finnishtransportagency',
      repo: 'dvk',
      branchOrRef: 'feature/DVK-795-automaattitestit-korjaus',
      reportBuildStatus: false,
      webhook: false,
    };
    const testBucket = new Bucket(this, 'ScheduledTestsBucket', {
      bucketName: `dvkscheduledtests-` + env,
      publicReadAccess: false,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      encryption: BucketEncryption.S3_MANAGED,
      lifecycleRules: [{ expiration: Duration.days(7) }],
    });
    const gitHubSource = Source.gitHub(sourceProps);
    const project = new Project(this, 'DvkScheduledTests', {
      projectName: 'DvkScheduledTests-' + env,
      concurrentBuildLimit: 1,
      buildSpec: BuildSpec.fromObject({
        version: '0.2',
        phases: {
          build: {
            commands: [
              'cd test',
              'pip3 install --user --no-cache-dir -r requirements.txt',
              `xvfb-run --server-args="-screen 0 1920x1080x24 -ac" robot -v BROWSER:chrome -v URL:${importedCloudFrontURL} --outputdir report/dvk --xunit xunit.xml dvk`,
            ],
          },
        },
        reports: {
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
      },
      grantReportGroupPermissions: true,
      artifacts: Artifacts.s3({
        bucket: testBucket,
        includeBuildId: false,
        packageZip: false,
      }),
    });
    project.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['s3:*'],
        resources: [testBucket.bucketArn],
      })
    );
    project.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['cloudformation:*'],
        resources: [`arn:aws:cloudformation:eu-west-1:${this.account}:stack/DvkBackendStack-${Config.getEnvironment()}*`],
      })
    );

    const projectTarget = new CodeBuildProject(project);
    const hourlyRule = new Rule(this, 'TestScheduleRule-' + env, {
      schedule: Schedule.rate(Duration.hours(1)),
      targets: [projectTarget],
    });

    cdk.Tags.of(hourlyRule).add('project', 'dvk');
  }
}
