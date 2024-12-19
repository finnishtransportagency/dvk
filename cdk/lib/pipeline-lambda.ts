import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodejsfunction from 'aws-cdk-lib/aws-lambda-nodejs';
import * as iam from 'aws-cdk-lib/aws-iam';
import { CfnOutput } from 'aws-cdk-lib';
import * as ssm from 'aws-cdk-lib/aws-ssm';

export class PipelineLambda extends Construct {
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

    const handler = new nodejsfunction.NodejsFunction(this, 'WebhookHandler', {
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

    //TODO: jarkevat oikeudet pipeline ajoon lambdalle
    handler.role?.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AWSCodePipeline_FullAccess'));

    const endpointUrl = handler.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
    });

    new CfnOutput(this, 'PipelineLambdaUrl', {
      value: endpointUrl.url,
      exportName: 'PipelineLambdaUrl',
    });
  }
}
