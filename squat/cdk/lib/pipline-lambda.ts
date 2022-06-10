import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";

interface PipelineLambdaProps {
    env: string;
  }

export class PipelineLambda extends Construct {
  constructor(scope: Construct, id: string, props: PipelineLambdaProps) {
    super(scope, id);

    const importedSquatPipelineNameDev = cdk.Fn.importValue("SquatPipeline" + props.env);
    const importedSquatPipelineNameTest = cdk.Fn.importValue("SquatPipeline" + props.env);

    const handler = new lambda.Function(this, "WebhookHandler", {
      runtime: lambda.Runtime.NODEJS_16_X,
      code: lambda.Code.fromAsset("bin"),
      handler: "pipeline-lambda.handler",
      environment: {
        DEV_PIPELINE_SQUAT: importedSquatPipelineNameDev,
        TEST_PIPELINE_SQUAT: importedSquatPipelineNameTest
      }
    });

    //TODO: grantit pipeline ajoon lambdalle

  }
}