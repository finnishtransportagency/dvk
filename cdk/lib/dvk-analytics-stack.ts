// Import AWS CDK libraries
import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as cdk from 'aws-cdk-lib';
import { Repository } from 'aws-cdk-lib/aws-ecr';
import { Vpc } from 'aws-cdk-lib/aws-ec2';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { BucketEncryption } from 'aws-cdk-lib/aws-s3';

export class DvkAnalyticsStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps, env: string) {
    super(scope, id, props);

    const importedLogBucket = cdk.Fn.importValue('AccessLogBucket' + env);
    const importedDistributionId = cdk.Fn.importValue('SquatDistribution' + env);

    // create report bucket for dvk-analytics
    const reportBucket = new s3.Bucket(this, 'DvkAnalyticsReportBucket', {
      bucketName: 'dvk-analytics-report-' + env,
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: BucketEncryption.S3_MANAGED,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const vpc = Vpc.fromLookup(this, 'DvkVPC', { vpcName: this.getVPCName(env) });
    const ecsSecurityGroup = new ec2.SecurityGroup(this, 'ECSSecurityGroup', {
      vpc,
      allowAllOutbound: true,
    });

    // Define an IAM role for the Fargate task
    const taskRole = new iam.Role(this, 'DvkFargateTaskRole' + env, {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
    });

    // Get s3 instance of importedLogBucket
    const logBucketS3 = s3.Bucket.fromBucketName(this, 'DvkCloudFrontLogBucket', importedLogBucket);

    // Add permissions to download the cloudwatch accesslogs from S3 bucket
    // TODO: "it's not possible to tell whether the bucket already has a policy attached, let alone to re-use that policy to add more statements to it"
    // that means we have to change to direct methods ie. logBucket.grantRead etc
    logBucketS3.addToResourcePolicy(
      new iam.PolicyStatement({
        actions: ['s3:GetObject', 's3:ListBucket'],
        resources: [logBucketS3.bucketArn, logBucketS3.arnForObjects('*')],
        principals: [taskRole.grantPrincipal],
      })
    );

    taskRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ['s3:GetObject', 's3:ListBucket'],
        resources: [logBucketS3.bucketArn, logBucketS3.arnForObjects('*')],
      })
    );

    // add putObject permission to reportBucket for taskRole
    reportBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        actions: ['s3:PutObject'],
        resources: [reportBucket.bucketArn, reportBucket.arnForObjects('*')],
        principals: [taskRole.grantPrincipal],
      })
    );

    taskRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ['s3:PutObject'],
        resources: [reportBucket.bucketArn, reportBucket.arnForObjects('*')],
      })
    );

    const cluster = new ecs.Cluster(this, 'ECSCluster', {
      vpc: vpc,
    });

    // Define the Fargate task definition
    const taskDefinition = new ecs.FargateTaskDefinition(this, 'DvkFargateTask' + env, {
      memoryLimitMiB: 1024,
      cpu: 512,
      taskRole,
    });

    // Degine log group for the Fargate task definition
    const logGroup = new logs.LogGroup(this, 'LogGroup', {
      logGroupName: '/ecs/dvk-analytics-' + env,
      retention: logs.RetentionDays.TWO_WEEKS,
    });

    // Define your container image and task definition details
    taskDefinition.addContainer('DvkAnalyticsContainer' + env, {
      image: ecs.ContainerImage.fromEcrRepository(Repository.fromRepositoryName(this, 'DvkAnalyticsImage', 'dvk-analyticsimage'), '1.0.1'),
      environment: {
        REPORT_BUCKET: reportBucket.bucketName,
        LOG_BUCKET: importedLogBucket,
        CF_DISTRIBUTION: importedDistributionId,
      },
      logging: ecs.LogDrivers.awsLogs({
        logGroup: logGroup,
        streamPrefix: 'AnalyticsContainer',
      }),
    });

    // Define the ECS service
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const fargateService = new ecs.FargateService(this, 'DvkFargateScheduled' + env, {
      cluster,
      taskDefinition,
      securityGroups: [ecsSecurityGroup],
      desiredCount: 0,
    });

    // TODO: using this or ecsPatterns.ScheduledFargateTask end up in error due to wrong type of subnets
    // but doing it manually from the console does not so it is used for now to finish the job

    // // Define the rule for scheduling the Fargate task
    // const rule = new events.Rule(this, 'DvkAnalyticsScheduledRule', {
    //   schedule: events.Schedule.cron({ minute: '0', hour: '0' }), // Daily at midnight
    // });

    // rule.addTarget(
    //   new targets.EcsTask({
    //     cluster: cluster,
    //     taskDefinition,
    //   })
    // );
  }

  private getVPCName(env: string): string {
    if (env === 'test') {
      return 'DvkTest-VPC';
    } else if (env === 'prod') {
      return 'DVKProd-VPC';
    } else {
      return 'DvkDev-VPC';
    }
  }
}
