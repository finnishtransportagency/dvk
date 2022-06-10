import * as codepipeline from "aws-cdk-lib/aws-codepipeline";

const devPipelineSquat = process.env.DEV_PIPELINE_SQUAT;
const testPipelineSquat = process.env.TEST_PIPELINE_SQUAT;

const handler = async function (event: any, context: any) {
  //TODO: validoi github webhook pyynto kts. github headerit ja secret

  console.log(event);
  console.log(devPipelineSquat);
  console.log(testPipelineSquat);

  //TODO: parsi event tiedot ja kaynnista oikea pipeline
  //codepipeline.Pipeline.call(...)
  
  return {
    statusCode: 200,
    headers: {},
    body: JSON.stringify("success"),
  };
};

export { handler };
