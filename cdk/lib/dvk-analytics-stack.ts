// Import AWS CDK libraries
import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as events from 'aws-cdk-lib/aws-events';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecsPatterns from 'aws-cdk-lib/aws-ecs-patterns';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as cdk from 'aws-cdk-lib';

export class DvkAnalyticsStack extends Stack {
  constructor(scope: Construct, id: string, env: string, props?: StackProps) {
    super(scope, id, props);

    const importedLogBucket = cdk.Fn.importValue('AccessLogBucket' + env); //DistributionId
    const importedDistributionId = cdk.Fn.importValue('SquatDistribution' + env);

    // Define an IAM role for the Fargate task
    const taskRole = new iam.Role(this, 'DvkFargateTaskRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
    });

    // Add permissions to access the S3 bucket
    taskRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ['s3:GetObject', 's3:ListBucket'],
        resources: [`arn:aws:s3:::${importedLogBucket}/*`],
      })
    );

    // Define the Fargate task definition
    const taskDefinition = new ecs.FargateTaskDefinition(this, 'DvkFargateTask', {
      memoryLimitMiB: 1024,
      cpu: 512,
      taskRole,
    });

    // Define your container image and task definition details
    taskDefinition.addContainer('DvkAnalyticsContainer', {
      image: ecs.ContainerImage.fromRegistry('dvk-image-repo/your-image:latest'), //TODO: image
      environment: {
        LOG_BUCKET: importedLogBucket,
        CF_DISTRIBUTION: importedDistributionId,
      },
    });

    // Define the ECS service
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const fargateService = new ecsPatterns.ScheduledFargateTask(this, 'DvkFargateScheduler', {
      scheduledFargateTaskDefinitionOptions: {
        taskDefinition,
      },
      schedule: events.Schedule.cron({ minute: '0', hour: '0' }), // Daily at midnight
    });
  }
}
