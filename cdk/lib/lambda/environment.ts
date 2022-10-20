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

export function isFeatureEnvironment() {
  return 'feature' === getEnvironment();
}

export function getAllowOrigin() {
  return `http://localhost:${isFeatureEnvironment() ? '3001' : '3000'}`;
}

export function getHeaders(): Record<string, string> {
  if (isPermanentEnvironment()) {
    return { 'Content-Type': 'application/json', 'Content-Encoding': 'gzip' };
  }
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': getAllowOrigin(),
    'Access-Control-Allow-Methods': '*',
    'Access-Control-Allow-Headers': '*',
    'Content-Encoding': 'gzip',
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

export async function readParametersByPath(path: string): Promise<Record<string, string>> {
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

export async function getVatuHeaders(): Promise<Record<string, string>> {
  return {
    Authorization: 'Basic ' + Buffer.from(`${await getVatuUsername()}:${await getVatuPassword()}`).toString('base64'),
    'Content-type': 'application/json',
    'Accept-Encoding': 'gzip',
  };
}

export async function getRocketChatCredentials() {
  const parameters = { ...(await readParametersByPath('/')) };
  const { RocketchatUser, RocketchatPassword } = parameters;
  return { RocketchatUser, RocketchatPassword };
}
