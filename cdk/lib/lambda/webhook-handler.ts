import { CodePipelineClient, ListPipelinesCommand } from "@aws-sdk/client-codepipeline";

const devPipelineSquat = process.env.DEV_PIPELINE_SQUAT;
const testPipelineSquat = process.env.TEST_PIPELINE_SQUAT;

const handler = async function (event: any, context: any) {
  //TODO: validoi github webhook pyynto kts. github headerit ja secret
  console.log("validate signature:", event.headers);

  console.log(event);
  console.log(devPipelineSquat);
  console.log(testPipelineSquat);

  //TODO: parsi event tiedot ja kaynnista oikea pipeline
  try {
    const client = new CodePipelineClient({});
    const command = new ListPipelinesCommand({});
    const response = await client.send(command);
    console.log(response.pipelines);
  } catch (error) {
    console.log(error);
    return {
      statusCode: 400,
      body: `Cannot process event: ${error}`,
    };
  }

  return {
    statusCode: 200,
    headers: {},
    body: JSON.stringify({ received: true }),
  };
};

export { handler };
