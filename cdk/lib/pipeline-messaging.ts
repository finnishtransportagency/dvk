import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as notifications from 'aws-cdk-lib/aws-codestarnotifications';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as nodejsfunction from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as subscription from 'aws-cdk-lib/aws-sns-subscriptions';
import { CfnOutput } from 'aws-cdk-lib';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { LayerVersion } from 'aws-cdk-lib/aws-lambda';
export class PipelineMessaging extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);
    const layer = LayerVersion.fromLayerVersionArn(
      this,
      'ParameterLayer',
      'arn:aws:lambda:eu-west-1:015030872274:layer:AWS-Parameters-and-Secrets-Lambda-Extension:11'
    );
    const messageHandler = new nodejsfunction.NodejsFunction(this, 'WebhookHandler', {
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: 'lib/lambda/message-handler.ts',
      handler: 'handler',
      layers: [layer],
      environment: {
        PARAMETERS_SECRETS_EXTENSION_HTTP_PORT: '2773',
        PARAMETERS_SECRETS_EXTENSION_LOG_LEVEL: 'DEBUG',
        SSM_PARAMETER_STORE_TTL: '300',
      },
    });

    messageHandler.addToRolePolicy(new PolicyStatement({ effect: Effect.ALLOW, actions: ['ssm:GetParameter'], resources: ['*'] }));

    const importedSquatPipelineArnDev = cdk.Fn.importValue('SquatPipeline-ARN-dev');
    const importedSquatPipelineArnTest = cdk.Fn.importValue('SquatPipeline-ARN-test');
    const importedDVKPipelineArnDev = cdk.Fn.importValue('DvkPipeline-ARN-dev');
    const importedDVKPipelineArnTest = cdk.Fn.importValue('DvkPipeline-ARN-test');

    const pipelineMap = new Map([
      [importedSquatPipelineArnDev, '-squat-dev'],
      [importedSquatPipelineArnTest, '-squat-test'],
      [importedDVKPipelineArnDev, '-dvk-dev'],
      [importedDVKPipelineArnTest, '-dvk-test'],
    ]);

    // Shared SNS and message handler
    const topic = new sns.Topic(this, 'DvkBuildNotificationsTopic');
    topic.addSubscription(new subscription.LambdaSubscription(messageHandler));

    pipelineMap.forEach((pipelineId, pipelineARN) => {
      const pipeline = codepipeline.Pipeline.fromPipelineArn(this, 'ImportedPipeline' + pipelineId, pipelineARN);

      // Pipeline notification
      new notifications.NotificationRule(this, 'NotificationRule' + pipelineId, {
        source: pipeline,
        events: [
          'codepipeline-pipeline-pipeline-execution-started',
          'codepipeline-pipeline-pipeline-execution-succeeded',
          'codepipeline-pipeline-pipeline-execution-failed',
        ],
        targets: [topic],
      });
    });

    new CfnOutput(this, 'TopicARN', {
      value: topic.topicArn,
      description: 'Notifications SNS topic ARN',
      exportName: 'NotificationsTopicARN',
    });
  }
}
