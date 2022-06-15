import { CodePipelineClient, ListPipelinesCommand } from "@aws-sdk/client-codepipeline";

const devPipelineSquat = process.env.DEV_PIPELINE_SQUAT;
const testPipelineSquat = process.env.TEST_PIPELINE_SQUAT;

const handler = async function (event: any, context: any) {
  console.log("Full event", event);

  const method = event.requestContext.http.method;
  if (!method || method !== "POST") {
    return {
      statusCode: 400,
      body: `Cannot process http method: ${method}`,
    };
  }
  //TODO: validoi github webhook pyynto kts. github headerit ja secret
  validateSignature(event.headers);

  //TODO: parsi event tiedot
  const githubData = event.body;
  const branch = githubData.ref;

  if (!branch || !isDevTestProd(branch)) {
    return {
      statusCode: 400,
      body: `Branch isn't deployable: ${branch}`,
    };
  }

  const commit = githubData?.commits?.[0];

  if (!commit) {
    return {
      statusCode: 400,
      body: `No commit found`,
    };
  }

  const commitAdded: string[] = commit.added;
  const commitRemoved: string[] = commit.removed;
  const commitModified: string[] = commit.modified;

  getDistinctFolders(commitAdded);
  getDistinctFolders(commitRemoved);
  getDistinctFolders(commitModified);

  // TODO: kaynnista oikea pipeline
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

const validBranches = ["main", "test", "prod"];
function isDevTestProd(branch: string) {
  return validBranches.includes(branch);
}

const ignoredTypes = ["txt", "md", "gitignore", "dockerignore", "pdf"];
function getDistinctFolders(fileinfo: string[]): string[] {
  console.log("fileinfo in: ", fileinfo);
  const filteredFiles = fileinfo.filter((file) => {
    const extension = file.split(".").pop();
    if (extension && ignoredTypes.includes(extension)) {
      console.log("removing ignored file: ", file);
      return false;
    }
    return true;
  });
  console.log("after removing ignored files: ", filteredFiles);
  const folders = filteredFiles.map((filteredFile) => filteredFile.slice(0, filteredFile.indexOf("/")));
  const distinctFolders = [...new Set<string>(folders)];
  console.log("distinct folders: ", distinctFolders);

  return distinctFolders;
}

type EventHeaders = {
  "x-hub-signature-256": string;
  "content-length": number;
  "x-amzn-tls-version": string;
  "x-forwarded-proto": string;
  "x-github-delivery": string;
  "x-forwarded-port": number;
  "x-forwarded-for": string;
  "x-github-hook-installation-target-id": string;
  "x-amzn-tls-cipher-suite": string;
  "x-amzn-trace-id": string;
  "x-github-event": string;
  host: string;
  accept: string;
  "content-type": string;
  "x-github-hook-id": string;
  "user-agent": string;
  "x-github-hook-installation-target-type": string;
  "x-hub-signature": string;
};
function validateSignature(headers: EventHeaders) {
  // validate signature
  console.log("validating headers", headers);
}

export { handler };
