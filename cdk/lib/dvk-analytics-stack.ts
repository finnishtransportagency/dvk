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
import * as efs from 'aws-cdk-lib/aws-efs';

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
      enforceSSL: true,
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
    // "it's not possible to tell whether the bucket already has a policy attached, let alone to re-use that policy to add more statements to it"
    // that means we have to change to direct grant
    logBucketS3.grantRead(taskRole);

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

    const efsFileSystem = new efs.FileSystem(this, 'EfsFileSystem', {
      vpc,
      encrypted: true,
      lifecyclePolicy: efs.LifecyclePolicy.AFTER_7_DAYS, // Optional
      performanceMode: efs.PerformanceMode.GENERAL_PURPOSE, // Optional
      throughputMode: efs.ThroughputMode.BURSTING, // Optional
    });

    efsFileSystem.addToResourcePolicy(
      new iam.PolicyStatement({
        actions: ['elasticfilesystem:ClientMount', 'elasticfilesystem:ClientWrite', 'elasticfilesystem:ClientRootAccess'],
        principals: [new iam.AnyPrincipal()],
        conditions: {
          Bool: {
            'elasticfilesystem:AccessedViaMountTarget': 'true',
          },
        },
      })
    );

    const efsAccessPoint = efsFileSystem.addAccessPoint('EfsAccessPoint', {
      createAcl: {
        ownerGid: '1000',
        ownerUid: '1000',
        permissions: '0755',
      },
      path: '/analytics',
      posixUser: {
        gid: '1000',
        uid: '1000',
      },
    });

    const cluster = new ecs.Cluster(this, 'ECSCluster', {
      vpc: vpc,
    });

    // Define the Fargate task definition
    const taskDefinition = new ecs.FargateTaskDefinition(this, 'DvkFargateTask' + env, {
      memoryLimitMiB: 2048,
      cpu: 1024,
      taskRole,
      volumes: [
        {
          name: 'efs-volume-' + env,
          efsVolumeConfiguration: {
            fileSystemId: efsFileSystem.fileSystemId,
            rootDirectory: '/',
            transitEncryption: 'ENABLED',
            authorizationConfig: {
              accessPointId: efsAccessPoint.accessPointId,
              iam: 'ENABLED',
            },
          },
        },
      ],
    });

    // Degine log group for the Fargate task definition
    const logGroup = new logs.LogGroup(this, 'LogGroup', {
      logGroupName: '/ecs/dvk-analytics-' + env,
      retention: logs.RetentionDays.TWO_WEEKS,
    });

    // Define your container image and task definition details
    const container = taskDefinition.addContainer('DvkAnalyticsContainer' + env, {
      image: ecs.ContainerImage.fromEcrRepository(Repository.fromRepositoryName(this, 'DvkAnalyticsImage', 'dvk-analyticsimage'), '1.0.4'),
      environment: {
        REPORT_BUCKET: reportBucket.bucketName,
        LOG_BUCKET: importedLogBucket,
        CF_DISTRIBUTION: importedDistributionId,
      },
      logging: ecs.LogDrivers.awsLogs({
        logGroup: logGroup,
        streamPrefix: 'AnalyticsContainer',
      }),
      readonlyRootFilesystem: true,
    });

    container.addMountPoints({
      sourceVolume: 'efs-volume-' + env,
      containerPath: '/analytics',
      readOnly: false,
    });

    // Define the ECS service
    const fargateService = new ecs.FargateService(this, 'DvkFargateScheduled' + env, {
      cluster,
      taskDefinition,
      securityGroups: [ecsSecurityGroup],
      desiredCount: 0,
    });

    efsFileSystem.grantRootAccess(fargateService.taskDefinition.taskRole.grantPrincipal);
    efsFileSystem.connections.allowDefaultPortFrom(fargateService.connections);

    // TODO: using this or ecsPatterns.ScheduledFargateTask end up in error due to wrong type of subnets
    // but doing it manually from the console does not so it is used for now to finish the job
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
