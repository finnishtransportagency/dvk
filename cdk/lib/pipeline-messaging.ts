import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as notifications from 'aws-cdk-lib/aws-codestarnotifications';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as nodejsfunction from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as ssm from 'aws-cdk-lib/aws-ssm';
export class PipelineMessaging extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const messageHandler = new nodejsfunction.NodejsFunction(this, 'WebhookHandler', {
      runtime: lambda.Runtime.NODEJS_16_X,
      entry: 'lib/lambda/message-handler.ts',
      handler: 'handler',
      environment: {
        ROCKETCHAT_USER: ssm.StringParameter.valueForStringParameter(this, 'RocketchatUser'),
        ROCKETCHAT_PASSWORD: ssm.StringParameter.valueForStringParameter(this, 'RocketchatPassword'),
      },
    });

    const importedSquatPipelineArnDev = cdk.Fn.importValue('SquatPipeline-ARN-dev');
    // const importedSquatPipelineArnTest = cdk.Fn.importValue('SquatPipeline-ARN-test');
    // const importedDVKPipelineArnDev = cdk.Fn.importValue('DvkPipeline-ARN-dev');
    // const importedDVKPipelineArnTest = cdk.Fn.importValue('DvkPipeline-ARN-test');

    const pipelineMap = new Map([
      [importedSquatPipelineArnDev, '-squat-dev'],
      //   [importedSquatPipelineArnTest, '-squat-test'],
      //   [importedDVKPipelineArnDev, '-dvk-dev'],
      //   [importedDVKPipelineArnTest, '-dvk-test'],
    ]);

    // Shared SNS and message handler
    const topic = new sns.Topic(this, 'DvkBuildNotificationsTopic');
    new sns.Subscription(this, 'LambdaSubscription', {
      topic,
      protocol: sns.SubscriptionProtocol.LAMBDA,
      endpoint: messageHandler.functionArn,
    });

    // pipelineMap.forEach((pipelineId, pipelineARN) => {
    //   const pipeline = codepipeline.Pipeline.fromPipelineArn(this, 'ImportedPipeline' + pipelineId, pipelineARN);

    //   // Pipeline notification
    //   const rule = new notifications.NotificationRule(this, 'NotificationRule' + pipelineId, {
    //     source: pipeline,
    //     events: ['codebuild-project-build-state-succeeded', 'codebuild-project-build-state-failed'],
    //     targets: [topic],
    //   });
    // });
  }
}
