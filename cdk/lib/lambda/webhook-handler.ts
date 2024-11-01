import { CodePipelineClient, StartPipelineExecutionCommand } from '@aws-sdk/client-codepipeline';
import { createHmac } from 'crypto';

const devPipelineSquat = process.env.DEV_PIPELINE_SQUAT;
const testPipelineSquat = process.env.TEST_PIPELINE_SQUAT;
const devPipelineDVK = process.env.DEV_PIPELINE_DVK;
const testPipelineDVK = process.env.TEST_PIPELINE_DVK;
const devPipelineAdmin = process.env.DEV_PIPELINE_ADMIN;
const testPipelineAdmin = process.env.TEST_PIPELINE_ADMIN;
const devPipelinePreview = process.env.DEV_PIPELINE_PREVIEW;
const testPipelinePreview = process.env.TEST_PIPELINE_PREVIEW;

const buildimagePipeline = process.env.BUILDIMAGE_PIPELINE;
const webhookSecret = process.env.WEBHOOK_SECRET;

enum APPS {
  SQUAT = 'squat',
  DVK = 'dvk',
  IMAGE = 'image',
  ADMIN = 'admin',
  PREVIEW = 'preview',
}

function parseBranchName(branch: string) {
  const fullBranchName = branch.replace('refs/heads/', '').trim();
  const endIndex = fullBranchName.indexOf('/');
  const branchName = fullBranchName.slice(0, endIndex > 0 ? endIndex : undefined);
  console.log('parsed branch name', branchName);
  return branchName;
}

function getPipelineName(branch: string, appName: string) {
  const branchName = parseBranchName(branch);
  switch (appName) {
    case APPS.SQUAT:
      if (branchName === 'main') {
        return devPipelineSquat;
      } else if (branchName === 'test') {
        return testPipelineSquat;
      }
      return undefined;
    case APPS.DVK:
      if (branchName === 'main') {
        return devPipelineDVK;
      } else if (branchName === 'test') {
        return testPipelineDVK;
      }
      return undefined;
    case APPS.ADMIN:
      if (branchName === 'main') {
        return devPipelineAdmin;
      } else if (branchName === 'test') {
        return testPipelineAdmin;
      }
      return undefined;
    case APPS.PREVIEW:
      if (branchName === 'main') {
        return devPipelinePreview;
      } else if (branchName === 'test') {
        return testPipelinePreview;
      }
      return undefined;
    case APPS.IMAGE:
      if (branchName === 'main') {
        return buildimagePipeline;
      }
      return undefined; // build imaget tarpeen paivittaa vain main-haarasta
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
    const folderSeparatorIndex = file.indexOf('/');
    if (folderSeparatorIndex < 1 || (extension && ignoredTypes.includes(extension))) {
      console.log('removing root file or ignored file: ', file);
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
function hasDockerFiles(fileinfo: string[]): boolean {
  console.log('checking for dockerfiles');
  if (fileinfo.includes('Dockerfile') || fileinfo.includes('test/Dockerfile')) {
    console.log('found dockerfile');
    return true;
  }
  return false;
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

interface GithubUser {
  name: string;
  email: string;
  username: string;
}
interface GithubCommit {
  id: string;
  tree_id: string;
  distinct: boolean;
  message: string;
  timestamp: string;
  url: string;
  author: GithubUser;
  committer: GithubUser;
  added: string[];
  removed: string[];
  modified: string[];
}

interface WebhookResponse {
  statusCode: number;
  body: string;
  headers?: object;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function validateSignature(event: any): boolean {
  if (!webhookSecret) {
    console.error('webhook secret is missing');
    return false;
  }

  let body;
  // if event is from ALB, then it will be base64encoded, if it is from "functionurl" lambda then it isn't
  if (event.isBase64Encoded) {
    const base64body = Buffer.from(event.body, 'base64').toString();
    console.log('base64 decoded body: ', base64body);
    body = JSON.parse(base64body);
  } else {
    body = JSON.parse(event.body);
  }

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

async function kaynnistaPipeline(pipelineName: string | undefined) {
  console.log('starting pipeline: ', pipelineName);
  try {
    const client = new CodePipelineClient({});
    const command = new StartPipelineExecutionCommand({
      name: pipelineName,
    });
    const response = await client.send(command);
    console.log('pipeline execution started: ', response.pipelineExecutionId);
  } catch (error) {
    console.log(error);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function validateEvent(event: any): WebhookResponse | undefined {
  let response: WebhookResponse | undefined = undefined;

  const method = event.requestContext?.http?.method || event.httpMethod;
  if (!method || method !== 'POST') {
    response = {
      statusCode: 400,
      body: `Cannot process http method: ${method}`,
    };
  }

  const valid = validateSignature(event);
  if (!valid) {
    response = {
      statusCode: 403,
      body: `Signature isn't valid`,
    };
  }

  const githubData = JSON.parse(event.body);
  const branch = githubData.ref;

  if (!branch || !isDevTestProd(branch)) {
    response = {
      statusCode: 400,
      body: `Branch isn't deployable: ${branch}`,
    };
  }

  const commits: GithubCommit[] = githubData?.commits;
  if (!commits) {
    response = {
      statusCode: 404,
      body: `No commits found in payload`,
    };
  }

  return response;
}

function validateCommits(folders: string[], isDockerFiles: boolean) {
  let response: WebhookResponse | undefined = undefined;

  if (!isDockerFiles && (!folders || folders.length < 1)) {
    response = {
      statusCode: 400,
      body: `No suitable application files or folders in commit`,
    };
  }

  return response;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handler = async function (event: any) {
  console.log('Full event', event);

  let response = validateEvent(event);
  if (response) {
    return response;
  }
  let { branch, commitAdded, commitRemoved, commitModified } = getCommitDataFromEventBody(event.body);

  const folders = getDistinctFolders(commitAdded.concat(commitRemoved).concat(commitModified));
  const isDockerFiles = hasDockerFiles(commitAdded.concat(commitRemoved).concat(commitModified));

  response = validateCommits(folders, isDockerFiles);
  if (response) {
    return response;
  }

  startPipelines(folders, branch, isDockerFiles);
  response = {
    statusCode: 200,
    headers: {},
    body: JSON.stringify({ received: true }),
  };

  return response;
};

function startPipelines(folders: string[], branch: any, isDockerFiles: boolean) {
  // Kaynnista tarvittaessa squat-pipelinet
  if (folders.includes('squat')) {
    startPipeline(branch, APPS.SQUAT);
  }
  // ja DVK-pipelinet
  // 13.10.2023 DVK:lla nykyaan riippuvuus squattiin upotuksen takia
  if (folders.includes('src') || folders.includes('public') || folders.includes('cdk') || folders.includes('squat')) {
    startPipeline(branch, APPS.DVK);
  }
  if (folders.includes('admin')) {
    startPipeline(branch, APPS.ADMIN);
  }
  // ja build image -pipeline
  if (isDockerFiles) {
    startPipeline(branch, APPS.IMAGE);
  }
  // esikatselusovellus kaytannossa sama kuin dvk -squat
  if (folders.includes('src') || folders.includes('public') || folders.includes('cdk')) {
    startPipeline(branch, APPS.PREVIEW);
  }
}

async function startPipeline(branch: string, app: APPS) {
  const pipelineName = getPipelineName(branch, app);
  if (pipelineName) await kaynnistaPipeline(pipelineName);
}

const getCommitDataFromEventBody = (eventBody: string) => {
  const githubData = JSON.parse(eventBody);
  const branch = githubData.ref;
  const commits: GithubCommit[] = githubData?.commits;
  let commitAdded: string[] = [];
  let commitRemoved: string[] = [];
  let commitModified: string[] = [];
  commits.forEach((commit: GithubCommit) => {
    commitAdded = commitAdded.concat(commit.added);
    commitRemoved = commitRemoved.concat(commit.removed);
    commitModified = commitModified.concat(commit.modified);
  });
  return { branch, commitAdded, commitRemoved, commitModified };
};

export { handler };
