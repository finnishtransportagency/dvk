// Import AWS CDK libraries
import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as events from 'aws-cdk-lib/aws-events';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecsPatterns from 'aws-cdk-lib/aws-ecs-patterns';
import * as iam from 'aws-cdk-lib/aws-iam';

export class DvkAnalyticsStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Define an IAM role for the Fargate task
    const taskRole = new iam.Role(this, 'DvkFargateTaskRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
    });

    // Add permissions to access the S3 bucket
    taskRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ['s3:GetObject', 's3:ListBucket'],
        resources: ['arn:aws:s3:::log-s3-bucket-name/*'], // TODO: S3 bucket
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
        //TODO: env vars
        LOG_BUCKET: 'cloudfront-dvk-dev',
        CF_DISTRIBUTION: 'E2GP14WC00IGAB',
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
