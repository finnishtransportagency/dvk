import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as nodejsfunction from "aws-cdk-lib/aws-lambda-nodejs";
import * as iam from "aws-cdk-lib/aws-iam";
import { CfnOutput } from "aws-cdk-lib";

export class PipelineLambda extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const importedSquatPipelineNameDev = cdk.Fn.importValue("SquatPipeline-dev");
    const importedSquatPipelineNameTest = cdk.Fn.importValue("SquatPipeline-test");

    const handler = new nodejsfunction.NodejsFunction(this, "WebhookHandler", {
      runtime: lambda.Runtime.NODEJS_16_X,
      entry: "lib/lambda/webhook-handler.ts",
      handler: "handler",
      environment: {
        DEV_PIPELINE_SQUAT: importedSquatPipelineNameDev,
        TEST_PIPELINE_SQUAT: importedSquatPipelineNameTest,
      },
    });

    //TODO: jarkevat oikeudet pipeline ajoon lambdalle
    handler.role?.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName("AWSCodePipeline_FullAccess"));

    const endpointUrl = handler.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
    });

    new CfnOutput(this, "PipelineLambdaUrl", {
      value: endpointUrl.url,
      exportName: "PipelineLambdaUrl",
    });
  }
}
