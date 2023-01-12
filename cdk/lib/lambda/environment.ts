import axios from 'axios';
import { log } from './logger';

const envParameters: Record<string, string> = {};

function errorMessage(variable: string): string {
  return `Environment variable ${variable} missing`;
}

export function getEnvironment(): string {
  if (process.env.ENVIRONMENT) {
    return process.env.ENVIRONMENT;
  }
  throw new Error(errorMessage('ENVIRONMENT'));
}

function getExtensionPort(): string {
  if (process.env.PARAMETERS_SECRETS_EXTENSION_HTTP_PORT) {
    return process.env.PARAMETERS_SECRETS_EXTENSION_HTTP_PORT;
  }
  throw new Error(errorMessage('PARAMETERS_SECRETS_EXTENSION_HTTP_PORT'));
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

async function readParameterByPath(path: string): Promise<string | undefined> {
  const url = `http://localhost:${getExtensionPort()}/systemsmanager/parameters/get/?name=${path}&withDecryption=true`;
  const start = Date.now();
  const response = await axios
    .get(url, {
      headers: { 'X-Aws-Parameters-Secrets-Token': process.env.AWS_SESSION_TOKEN as string },
    })
    .catch(function (error) {
      const errorObj = error.toJSON();
      // ignore parameter not found
      if (errorObj.status !== 400) {
        log.fatal(`Parameter cache fetch failed: status=%d code=%s message=%s`, errorObj.status, errorObj.code, errorObj.message);
      }
    });
  log.debug(`Parameter cache response time: ${Date.now() - start} ms`);
  if (response?.data) {
    return response.data.Parameter.Value;
  }
  return undefined;
}

async function readParameterForEnv(path: string): Promise<string> {
  if (envParameters[path]) {
    return envParameters[path];
  }
  const value = await readParameterByPath('/' + path);
  if (value) {
    envParameters[path] = value;
    return value;
  }
  throw new Error(`Getting parameter ${path} failed`);
}

export async function getVatuUsername() {
  return readParameterForEnv('VatuUsername');
}

export async function getVatuPassword() {
  return readParameterForEnv('VatuPassword');
}

export async function getVatuUrl() {
  return readParameterForEnv('VatuUrl');
}

export async function getFeatureCacheDurationHours() {
  const value = await readParameterForEnv('FeatureCacheDurationHours');
  return value ? Number.parseFloat(value) : 0;
}

export async function getVatuHeaders(): Promise<Record<string, string>> {
  return {
    Authorization: 'Basic ' + Buffer.from(`${await getVatuUsername()}:${await getVatuPassword()}`).toString('base64'),
    'Content-type': 'application/json',
    'Accept-Encoding': 'gzip',
  };
}

export async function getRocketChatCredentials() {
  const RocketchatUser = await readParameterForEnv('/RocketchatUser');
  const RocketchatPassword = await readParameterForEnv('/RocketchatPassword');
  return { RocketchatUser, RocketchatPassword };
}

async function getPookiUsername() {
  return readParameterForEnv('PookiUsername');
}

async function getPookiPassword() {
  return readParameterForEnv('PookiPassword');
}

export async function getPookiUrl() {
  return readParameterForEnv('PookiUrl');
}

export async function getPookiHeaders(): Promise<Record<string, string>> {
  return {
    Authorization: 'Basic ' + Buffer.from(`${await getPookiUsername()}:${await getPookiPassword()}`).toString('base64'),
    'Content-type': 'application/json',
    'Accept-Encoding': 'gzip',
  };
}
