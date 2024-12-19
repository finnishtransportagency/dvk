import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodejsfunction from 'aws-cdk-lib/aws-lambda-nodejs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Vpc } from 'aws-cdk-lib/aws-ec2';
import { ApplicationLoadBalancer, ApplicationProtocol, ListenerAction } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { LambdaTarget } from 'aws-cdk-lib/aws-elasticloadbalancingv2-targets';

export class PipelineLambdaVpc extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const importedSquatPipelineNameDev = cdk.Fn.importValue('SquatPipeline-dev');
    const importedSquatPipelineNameTest = cdk.Fn.importValue('SquatPipeline-test');
    const importedDVKPipelineNameDev = cdk.Fn.importValue('DvkPipeline-dev');
    const importedDVKPipelineNameTest = cdk.Fn.importValue('DvkPipeline-test');
    const importedAdminPipelineNameDev = cdk.Fn.importValue('AdminPipeline-dev');
    const importedAdminPipelineNameTest = cdk.Fn.importValue('AdminPipeline-test');
    const importedPreviewPipelineNameDev = cdk.Fn.importValue('PreviewPipeline-dev');
    const importedPreviewPipelineNameTest = cdk.Fn.importValue('PreviewPipeline-test');
    const importedBuildimagePipelineName = cdk.Fn.importValue('BuildimagePipeline');
    const storedGithubWebhookSecret = ssm.StringParameter.valueForStringParameter(this, '/github/WebhookSecret', 1);

    const vpc = Vpc.fromLookup(this, 'DvkVPC', { vpcName: 'DvkDev-VPC' });

    const alb = new ApplicationLoadBalancer(this, 'ALB-GitHub', {
      vpc,
      internetFacing: false,
      loadBalancerName: `DvkALB-GitHub`,
    });

    const httpListener = alb.addListener('HTTPListener', {
      port: 80,
      protocol: ApplicationProtocol.HTTP,
      defaultAction: ListenerAction.fixedResponse(404),
      open: true,
    });

    const webhookLambda = new nodejsfunction.NodejsFunction(this, 'WebhookHandler', {
      vpc,
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: 'lib/lambda/webhook-handler.ts',
      handler: 'handler',
      environment: {
        DEV_PIPELINE_SQUAT: importedSquatPipelineNameDev,
        TEST_PIPELINE_SQUAT: importedSquatPipelineNameTest,
        DEV_PIPELINE_DVK: importedDVKPipelineNameDev,
        TEST_PIPELINE_DVK: importedDVKPipelineNameTest,
        DEV_PIPELINE_ADMIN: importedAdminPipelineNameDev,
        TEST_PIPELINE_ADMIN: importedAdminPipelineNameTest,
        DEV_PIPELINE_PREVIEW: importedPreviewPipelineNameDev,
        TEST_PIPELINE_PREVIEW: importedPreviewPipelineNameTest,
        BUILDIMAGE_PIPELINE: importedBuildimagePipelineName,
        WEBHOOK_SECRET: storedGithubWebhookSecret,
      },
    });

    webhookLambda.role?.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AWSCodePipeline_FullAccess'));

    httpListener.addTargets('webhookLambda', {
      targets: [new LambdaTarget(webhookLambda)],
    });
  }
}
