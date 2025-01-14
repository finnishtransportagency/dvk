import { readParameterByPath } from './api/axios';
import * as ParamStore from './parameterStoreConstants';

const envParameters: Record<string, string> = {};

function errorMessage(variable: string): string {
  return `Environment variable ${variable} missing`;
}
async function readParameterForEnv(path: string): Promise<string> {
  if (envParameters[path]) {
    return envParameters[path];
  }
  return new Promise((resolve, reject) => {
    readParameterByPath('/' + path)
      .then((value) => {
        if (value) {
          envParameters[path] = value;
          resolve(value);
        } else {
          throw new Error(`Getting parameter ${path} failed`);
        }
      })
      .catch((error) => {
        reject(error instanceof Error ? error : new Error(String(error)));
      });
  });
}

//Function will be removed when GeoJson support for VATU is in prod
async function readOptionalParameterForEnvWithDefault(path: string, defaultValue: string): Promise<string> {
  return new Promise((resolve) => {
    readParameterByPath('/' + path).then((value) => {
      resolve(value ?? defaultValue);
    });
  });
}

function getBasicAuthHeaders(username: string, password: string, acceptEncoding = 'gzip') {
  return {
    Authorization: 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64'),
    'Accept-Encoding': acceptEncoding,
  };
}

function getXApiKeyHeaders(key: string, acceptEncoding = 'gzip') {
  return {
    'x-api-key': key,
    'Accept-Encoding': acceptEncoding,
  };
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

export async function getVatuParameters() {
  return await Promise.all([
    readParameterForEnv(ParamStore.VATU_URL),
    readParameterForEnv(ParamStore.VATU_USERNAME),
    readParameterForEnv(ParamStore.VATU_PASSWORD),
  ]).then((values) => ({
    vatuUrl: values[0],
    vatuHeaders: getBasicAuthHeaders(values[1], values[2]),
  }));
}

export async function getVatuPilotRoutesParameters() {
  return await Promise.all([
    readParameterForEnv(ParamStore.VATU_PILOT_ROUTE_URL),
    readParameterForEnv(ParamStore.VATU_USERNAME),
    readParameterForEnv(ParamStore.VATU_PASSWORD),
  ]).then((values) => ({
    vatuPilotRoutesUrl: values[0],
    vatuHeaders: getBasicAuthHeaders(values[1], values[2]),
  }));
}

export async function getRocketChatCredentials() {
  return await Promise.all([readParameterForEnv(ParamStore.ROCKETCHAT_USER), readParameterForEnv(ParamStore.ROCKETCHAT_PASSWORD)]).then((values) => ({
    rocketChatUser: values[0],
    rocketChatPassword: values[1],
  }));
}

export async function getPookiParameters() {
  return await Promise.all([
    readParameterForEnv(ParamStore.POOKI_URL),
    readParameterForEnv(ParamStore.POOKI_USERNAME),
    readParameterForEnv(ParamStore.POOKI_PASSWORD),
  ]).then((values) => ({
    pookiUrl: values[0],
    pookiHeaders: getBasicAuthHeaders(values[1], values[2]),
  }));
}

export async function getIlmanetParameters() {
  return await Promise.all([
    readParameterForEnv(ParamStore.ILMANET_URL),
    readParameterForEnv(ParamStore.ILMANET_USERNAME),
    readParameterForEnv(ParamStore.ILMANET_PASSWORD),
    readParameterForEnv(ParamStore.WEATHER_SOA_API_KEY),
  ]).then((values) => ({
    ilmanetUrl: values[0],
    ilmanetUserName: values[1],
    ilmanetPassword: values[2],
    weatherHeaders: getXApiKeyHeaders(values[3]),
  }));
}

export async function getIBNetApiParameters() {
  return await Promise.all([
    readParameterForEnv(ParamStore.IBNET_API_URL),
    readParameterForEnv(ParamStore.VATU_USERNAME),
    readParameterForEnv(ParamStore.VATU_PASSWORD),
  ]).then((values) => ({
    ibNetApiUrl: values[0],
    vatuHeaders: getBasicAuthHeaders(values[1], values[2]),
  }));
}

export async function getSOAApiParameters() {
  return await Promise.all([readParameterForEnv(ParamStore.SOA_API_URL), readParameterForEnv(ParamStore.WEATHER_SOA_API_KEY)]).then((values) => ({
    soaApiUrl: values[0],
    weatherHeaders: getXApiKeyHeaders(values[1]),
  }));
}

export async function getAISParameters() {
  return await Promise.all([readParameterForEnv(ParamStore.SOA_API_URL), readParameterForEnv(ParamStore.AIS_SOA_API_KEY)]).then((values) => ({
    soaApiUrl: values[0],
    aisHeaders: getXApiKeyHeaders(values[1]),
  }));
}

export async function getCloudFrontKeys() {
  return await Promise.all([
    readParameterForEnv(getEnvironment() + '/' + ParamStore.CLOUDFRONT_PRIVATE_KEY),
    readParameterForEnv(getEnvironment() + '/' + ParamStore.CLOUDFRONT_PUBLIC_KEY_ID),
  ]).then((values) => ({
    cloudFrontPrivateKey: values[0],
    cloudFrontPublicKeyId: values[1],
  }));
}

export async function getCognitoUrl() {
  return readParameterForEnv(ParamStore.COGNITO_URL);
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

export async function getFeedbackSQSQueueUrl(): Promise<string> {
  const path = `${getEnvironment()}/feedback-sqs-queue-url`;
  return await readParameterForEnv(path);
}

export async function getEmailConfig(): Promise<{
  emailHost: string;
  emailPass: string;
  emailPort: string;
  emailUser: string;
  feedbackAddress: string;
}> {
  return await Promise.all([
    readParameterForEnv(`${getEnvironment()}/email/host`),
    readParameterForEnv(`${getEnvironment()}/email/pass`),
    readParameterForEnv(`${getEnvironment()}/email/port`),
    readParameterForEnv(`${getEnvironment()}/email/user`),
    readParameterForEnv(`${getEnvironment()}/email/feedbackAddress`),
  ]).then((values) => ({
    emailHost: values[0],
    emailPass: values[1],
    emailPort: values[2],
    emailUser: values[3],
    feedbackAddress: values[4],
  }));
}
