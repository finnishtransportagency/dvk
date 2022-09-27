// eslint-disable-next-line import/named
import { GetParametersByPathCommand, GetParametersByPathCommandOutput, SSMClient } from '@aws-sdk/client-ssm';

function errorMessage(variable: string): string {
  return `Environment variable ${variable} missing`;
}

function getEnvironment(): string {
  if (process.env.ENVIRONMENT) {
    return process.env.ENVIRONMENT;
  }
  throw new Error(errorMessage('ENVIRONMENT'));
}

export function isPermanentEnvironment() {
  return ['dev', 'test', 'prod'].indexOf(getEnvironment()) >= 0;
}

export function isProductionEnvironment() {
  return 'prod' === getEnvironment();
}

export function getHeaders(): Record<string, string> {
  if (isPermanentEnvironment()) {
    return { 'Content-Type': 'application/json' };
  }
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': 'http://localhost:3000',
    'Access-Control-Allow-Methods': '*',
    'Access-Control-Allow-Headers': '*',
  };
}

let euWestSSMClient: SSMClient;
let envParameters: Record<string, string>;

function getSSMClient(): SSMClient {
  if (!euWestSSMClient) {
    euWestSSMClient = new SSMClient({ region: 'eu-west-1' });
  }
  return euWestSSMClient;
}

async function readParametersByPath(path: string): Promise<Record<string, string>> {
  const variables: Record<string, string> = {};
  let nextToken;
  do {
    const output: GetParametersByPathCommandOutput = await getSSMClient().send(
      new GetParametersByPathCommand({ Path: path, WithDecryption: true, NextToken: nextToken })
    );
    output.Parameters?.forEach((param) => {
      if (param.Name && param.Value) {
        variables[param.Name.replace(path, '')] = param.Value;
      }
    });
    nextToken = output.NextToken;
  } while (nextToken);
  return variables;
}

async function readParametersForEnv(environment: string): Promise<Record<string, string>> {
  if (!envParameters) {
    envParameters = {
      ...(await readParametersByPath('/')), // Read global parameters from root
      ...(await readParametersByPath('/' + environment + '/')), // Then override with environment specific ones if provided
    };
  }
  return envParameters;
}

export async function getVatuUsername() {
  const parameters = await readParametersForEnv(getEnvironment());
  return parameters.VatuUsername;
}

export async function getVatuPassword() {
  const parameters = await readParametersForEnv(getEnvironment());
  return parameters.VatuPassword;
}

export async function getVatuUrl() {
  const parameters = await readParametersForEnv(getEnvironment());
  return parameters.VatuUrl;
}
