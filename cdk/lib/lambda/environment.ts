import { readParameterByPath } from './api/axios';

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

export function getFairwayCardTableName(): string {
  if (process.env.FAIRWAY_CARD_TABLE) {
    return process.env.FAIRWAY_CARD_TABLE;
  }
  throw new Error(errorMessage('FAIRWAY_CARD_TABLE'));
}

export function getHarborTableName(): string {
  if (process.env.HARBOR_TABLE) {
    return process.env.HARBOR_TABLE;
  }
  throw new Error(errorMessage('HARBOR_TABLE'));
}

export function getExtensionPort(): string {
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
  return getEnvironment().startsWith('feature');
}

export function getHeaders(): Record<string, string[]> {
  if (isPermanentEnvironment()) {
    return { 'Content-Type': ['application/json'], 'Content-Encoding': ['gzip'] };
  }
  return {
    'Content-Type': ['application/json'],
    'Access-Control-Allow-Origin': ['*'],
    'Access-Control-Allow-Methods': ['*'],
    'Access-Control-Allow-Headers': ['*'],
    'Content-Encoding': ['gzip'],
    'Access-Control-Expose-Headers': ['fetchedDate'],
  };
}

export function getWeatherResponseHeaders(): Record<string, string[]> {
  if (isPermanentEnvironment()) {
    return { 'Content-Type': ['application/json'] };
  }
  return {
    'Content-Type': ['application/json'],
    'Access-Control-Allow-Origin': ['*'],
    'Access-Control-Allow-Methods': ['*'],
    'Access-Control-Allow-Headers': ['*'],
    'Access-Control-Expose-Headers': ['fetchedDate'],
  };
}

export function getPilotRoutesHeaders(): Record<string, string[]> {
  // identical to getHeaders() for now, but could change in future
  if (isPermanentEnvironment()) {
    return { 'Content-Type': ['application/json'], 'Content-Encoding': ['gzip'] };
  }
  return {
    'Content-Type': ['application/json'],
    'Access-Control-Allow-Origin': ['*'],
    'Access-Control-Allow-Methods': ['*'],
    'Access-Control-Allow-Headers': ['*'],
    'Content-Encoding': ['gzip'],
  };
}

async function readParameterForEnv(path: string): Promise<string> {
  if (envParameters[path]) {
    return envParameters[path];
  }
  return new Promise((resolve) => {
    readParameterByPath('/' + path).then((value) => {
      if (value) {
        envParameters[path] = value;
        resolve(value);
      } else {
        throw new Error(`Getting parameter ${path} failed`);
      }
    });
  });
}

async function readOptionalParameterForEnvWithDefault(path: string, defaultValue: string): Promise<string> {
  return new Promise((resolve) => {
    readParameterByPath('/' + path).then((value) => {
      resolve(value ?? defaultValue);
    });
  });
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

export async function getVatuV2ApiSupport() {
  return isProductionEnvironment() ? '' : readOptionalParameterForEnvWithDefault('VatuV2Apis', '');
}

export async function getVatuPilotRoutesUrl() {
  return readParameterForEnv('VatuPilotRouteUrl');
}

export async function getVatuHeaders(): Promise<Record<string, string>> {
  return {
    Authorization: 'Basic ' + Buffer.from(`${await getVatuUsername()}:${await getVatuPassword()}`).toString('base64'),
    'Accept-Encoding': 'gzip',
  };
}

export async function getRocketChatCredentials() {
  const RocketchatUser = await readParameterForEnv('RocketchatUser');
  const RocketchatPassword = await readParameterForEnv('RocketchatPassword');
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
    'Accept-Encoding': 'gzip',
  };
}

export async function getSOAApiUrl() {
  return readParameterForEnv('SOAApiUrl');
}

async function getWeatherSOAApiKey() {
  return readParameterForEnv('WeatherSOAApiKey');
}

async function getAISSOAApiKey() {
  return readParameterForEnv('AISSOAApiKey');
}

export async function getIlmanetUrl() {
  return readParameterForEnv('IlmanetUrl');
}

export async function getIlmanetUsername() {
  return readParameterForEnv('IlmanetUsername');
}

export async function getIlmanetPassword() {
  return readParameterForEnv('IlmanetPassword');
}

export async function getIBNetApiUrl() {
  return readParameterForEnv('IBNetApiUrl');
}

export async function getWeatherHeaders(): Promise<Record<string, string>> {
  return new Promise((resolve) => {
    getWeatherSOAApiKey().then((key) => {
      resolve({
        'x-api-key': key,
        'Accept-Encoding': 'gzip',
      });
    });
  });
}

export async function getTraficomHeaders(): Promise<Record<string, string>> {
  return getWeatherHeaders();
}

export async function getAISHeaders(): Promise<Record<string, string>> {
  return {
    'x-api-key': await getAISSOAApiKey(),
    'Accept-Encoding': 'gzip',
  };
}

export async function getCloudFrontPrivateKey() {
  return readParameterForEnv(getEnvironment() + '/CloudFrontPrivateKey');
}

export async function getCloudFrontPublicKeyId() {
  return readParameterForEnv(getEnvironment() + '/CloudFrontPublicKeyId');
}

export async function getCognitoUrl() {
  return readParameterForEnv('CognitoUrl');
}

export function getExpires() {
  const days = process.env.DAYS_TO_EXPIRE ? Number.parseInt(process.env.DAYS_TO_EXPIRE, 10) : 30;
  return Math.round(Date.now() / 1000) + 60 * 60 * 24 * days;
}

export function getTimeout() {
  return process.env.API_TIMEOUT ? Number.parseInt(process.env.API_TIMEOUT, 10) : 10000;
}

export function getNewStaticBucketName() {
  if (isProductionEnvironment()) {
    return 'static2.dvk.vaylapilvi.fi';
  } else {
    return `static2.dvk${getEnvironment()}.testivaylapilvi.fi`;
  }
}
