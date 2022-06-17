import { CodePipelineClient, StartPipelineExecutionCommand } from '@aws-sdk/client-codepipeline';
import { createHmac } from 'crypto';

const devPipelineSquat = process.env.DEV_PIPELINE_SQUAT;
const testPipelineSquat = process.env.TEST_PIPELINE_SQUAT;
const webhookSecret = process.env.WEBHOOK_SECRET;

function parseBranchName(branch: string) {
  const fullBranchName = branch.replace('refs/heads/', '').trim();
  const endIndex = fullBranchName.indexOf('/');
  const branchName = fullBranchName.slice(0, endIndex > 0 ? endIndex : undefined);
  console.log('parsed branch name', branchName);
  return branchName;
}

function getPipelineName(branch: string, folder: string) {
  const branchName = parseBranchName(branch);
  switch (folder) {
    case 'squat':
      if (branchName === 'main') {
        return devPipelineSquat;
      } else if (branchName === 'test') {
        return testPipelineSquat;
      }
      return undefined;
    default:
      return undefined;
  }
}

const validBranches = ['main', 'test', 'prod'];
function isDevTestProd(branch: string) {
  return validBranches.includes(parseBranchName(branch));
}

const ignoredTypes = ['txt', 'md', 'gitignore', 'dockerignore', 'pdf'];
function getDistinctFolders(fileinfo: string[]): string[] {
  console.log('fileinfo in: ', fileinfo);
  const filteredFiles = fileinfo.filter((file) => {
    const extension = file.split('.').pop();
    if (extension && ignoredTypes.includes(extension)) {
      console.log('removing ignored file: ', file);
      return false;
    }
    return true;
  });
  console.log('after removing ignored files: ', filteredFiles);
  const folders = filteredFiles.map((filteredFile) => filteredFile.slice(0, filteredFile.indexOf('/')));
  const distinctFolders = [...new Set<string>(folders)];
  console.log('distinct folders: ', distinctFolders);

  return distinctFolders;
}

type EventHeaders = {
  'x-hub-signature-256': string;
  'content-length': number;
  'x-amzn-tls-version': string;
  'x-forwarded-proto': string;
  'x-github-delivery': string;
  'x-forwarded-port': number;
  'x-forwarded-for': string;
  'x-github-hook-installation-target-id': string;
  'x-amzn-tls-cipher-suite': string;
  'x-amzn-trace-id': string;
  'x-github-event': string;
  host: string;
  accept: string;
  'content-type': string;
  'x-github-hook-id': string;
  'user-agent': string;
  'x-github-hook-installation-target-type': string;
  'x-hub-signature': string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function validateSignature(event: any): boolean {
  if (!webhookSecret) {
    console.error('webhook secret is missing');
    return false;
  }
  const body = JSON.parse(event.body);
  const headers: EventHeaders = event.headers;
  if (!body || !headers) {
    console.error('error parsing body or headers');
    return false;
  }
  const hmacHex = createHmac('sha256', webhookSecret).update(event.body).digest('hex');
  const githubHex = headers['x-hub-signature-256'].split('sha256=').pop();
  console.log('hmac hex header received: ', githubHex);

  return hmacHex === githubHex;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handler = async function (event: any) {
  console.log('Full event', event);

  const method = event.requestContext.http.method;
  if (!method || method !== 'POST') {
    return {
      statusCode: 400,
      body: `Cannot process http method: ${method}`,
    };
  }

  const valid = validateSignature(event);
  if (!valid) {
    return {
      statusCode: 403,
      body: `Signature isn't valid`,
    };
  }

  const githubData = JSON.parse(event.body);
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
      statusCode: 404,
      body: `No commit found in payload`,
    };
  }

  const commitAdded: string[] = commit.added;
  const commitRemoved: string[] = commit.removed;
  const commitModified: string[] = commit.modified;

  // TODO: tarvitaanko erottelua tiedostotapahtuman perusteella vai ei
  const folders = getDistinctFolders(commitAdded.concat(commitRemoved).concat(commitModified));

  if (!folders || folders.length < 1) {
    return {
      statusCode: 400,
      body: `No suitable application files or folders in commit`,
    };
  }

  // TODO: kaynnistysmahdollisuus muillekin kuin squatille
  if (folders.includes('squat')) {
    const pipelineName = getPipelineName(branch, 'squat');
    console.log('pipeline name chosen: ', pipelineName);
    try {
      const client = new CodePipelineClient({});
      const command = new StartPipelineExecutionCommand({
        name: pipelineName,
      });
      const response = await client.send(command);
      console.log('pipeline execution started: ', response.pipelineExecutionId);
    } catch (error) {
      console.log(error);
      return {
        statusCode: 400,
        body: `Cannot process event: ${error}`,
      };
    }
  }

  return {
    statusCode: 200,
    headers: {},
    body: JSON.stringify({ received: true }),
  };
};

export { handler };
