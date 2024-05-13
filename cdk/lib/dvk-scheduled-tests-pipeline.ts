import * as cdk from 'aws-cdk-lib';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import { Repository } from 'aws-cdk-lib/aws-ecr';
import { Duration, Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import Config from './config';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { BlockPublicAccess, Bucket, BucketEncryption, BucketProps } from 'aws-cdk-lib/aws-s3';
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
    const importedSiteURL = cdk.Fn.importValue('DvkSiteUrl' + env);
    const importedCloudFrontURL = Config.isDeveloperEnvironment() ? 'https://' + cdk.Fn.importValue('CloudFrontDomainName' + env) : importedSiteURL; // Kehittajaymparistoista ei loydy certia, jolloin kaytetaan cloudfrontin dns-tietoa

    // The fine-grained access token works when using a Github source for CodePipeline, but apparently not when configuring it as a source for a plain CodeBuild
    new codebuild.GitHubSourceCredentials(this, 'DvkCodeBuildGitHub' + env, {
      accessToken: cdk.SecretValue.secretsManager('dev/dvk/github'),
    });

    const sourceProps: codebuild.GitHubSourceProps = {
      owner: 'finnishtransportagency',
      repo: 'dvk',
      branchOrRef: 'prod',
      reportBuildStatus: false,
      webhook: false,
    };

    const s3DeletePolicy: Pick<BucketProps, 'removalPolicy' | 'autoDeleteObjects'> = {
      removalPolicy: Config.isPermanentEnvironment() ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: Config.isPermanentEnvironment() ? undefined : true,
    };
    const testBucket = new Bucket(this, 'ScheduledTestsBucket', {
      bucketName: `dvkscheduledtests-` + env,
      publicReadAccess: false,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      encryption: BucketEncryption.S3_MANAGED,
      lifecycleRules: [{ expiration: Duration.days(7) }],
      ...s3DeletePolicy,
    });
    const gitHubSource = codebuild.Source.gitHub(sourceProps);
    const project = new codebuild.Project(this, 'DvkScheduledTests', {
      projectName: 'DvkScheduledTests-' + env,
      concurrentBuildLimit: 1,
      buildSpec: codebuild.BuildSpec.fromObject({
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
      cache: codebuild.Cache.local(codebuild.LocalCacheMode.CUSTOM, codebuild.LocalCacheMode.SOURCE, codebuild.LocalCacheMode.DOCKER_LAYER),
      environment: {
        buildImage: codebuild.LinuxBuildImage.fromEcrRepository(Repository.fromRepositoryName(this, 'DvkRobotImage', 'dvk-robotimage'), '1.0.3'),
        computeType: codebuild.ComputeType.MEDIUM,
      },
      grantReportGroupPermissions: true,
      artifacts: codebuild.Artifacts.s3({
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
