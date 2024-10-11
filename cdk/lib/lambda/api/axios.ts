import axios from 'axios';
import {
  getAISHeaders,
  getExtensionPort,
  getIBNetApiUrl,
  getIlmanetPassword,
  getIlmanetUrl,
  getIlmanetUsername,
  getPookiHeaders,
  getPookiUrl,
  getSOAApiUrl,
  getTimeout,
  getTraficomHeaders,
  getVatuHeaders,
  getVatuPilotRoutesUrl,
  getVatuUrl,
  getWeatherHeaders,
  isProductionEnvironment,
} from '../environment';
import { log } from '../logger';
import { FeatureCollection, Geometry } from 'geojson';
import { roundGeometry } from '../util';
import { VaylaGeojsonFeature, GeometryModel, RtzData, VaylaAPIModel, VesselAPIModel, VesselLocationFeatureCollection } from './apiModels';

export enum ExternalAPI {
  ILMANET = 'Ilmanet',
  POOKI = 'Pooki',
  TRAFICOM = 'Traficom',
  VATU = 'VATU',
  WEATHER = 'Weather',
  AIS = 'AIS',
  PILOTROUTE = 'PilotRoute',
  IBNET = 'IBNet',
}

export function getFetchErrorMessage(api: ExternalAPI): string {
  return `Fetching from ${api} api failed`;
}

export async function fetchTraficomApi<T>(path: string) {
  const url = `https://${await getSOAApiUrl()}/${path}`;
  const start = Date.now();
  const response = await axios
    .get(url, {
      headers: await getTraficomHeaders(),
      timeout: getTimeout(),
    })
    .catch(function (error) {
      const errorObj = error.toJSON();
      log.fatal(`${ExternalAPI.TRAFICOM} api %s fetch failed: status=%d code=%s message=%s`, path, errorObj.status, errorObj.code, errorObj.message);
      throw new Error(getFetchErrorMessage(ExternalAPI.TRAFICOM));
    });
  const duration = Date.now() - start;
  log.debug({ duration }, `Traficom api response time: ${duration} ms`);
  return response.data ? (response.data as T) : ({ type: 'FeatureCollection', features: [] } as FeatureCollection);
}

export async function fetchPilotRoutesApi() {
  const url = await getVatuPilotRoutesUrl();
  const start = Date.now();
  const response = await axios
    .get(url, {
      headers: await getVatuHeaders(),
    })
    .catch(function (error) {
      const errorObj = error.toJSON();
      log.fatal(`${ExternalAPI.PILOTROUTE} api %s fetch failed: status=%d code=%s message=%s`, errorObj.status, errorObj.code, errorObj.message);
      throw new Error(getFetchErrorMessage(ExternalAPI.PILOTROUTE));
    });
  const duration = Date.now() - start;
  log.debug({ duration }, `PILOTROUTE api response time: ${duration} ms`);
  return response.data ? (response.data as RtzData[]) : [];
}

async function fetchAISApi(path: string, params: Record<string, string>) {
  const url = `https://${await getSOAApiUrl()}/${path}`;
  const start = Date.now();
  const response = await axios
    .get(url, {
      headers: await getAISHeaders(),
      params,
      timeout: getTimeout(),
    })
    .catch(function (error) {
      const errorObj = error.toJSON();
      log.fatal(`${ExternalAPI.AIS} api %s fetch failed: status=%d code=%s message=%s`, path, errorObj.status, errorObj.code, errorObj.message);
      throw new Error(getFetchErrorMessage(ExternalAPI.AIS));
    });
  const duration = Date.now() - start;
  log.debug({ duration }, `AIS api response time: ${duration} ms`);
  return response;
}

export async function fetchAISMetadata(path: string, params: Record<string, string>) {
  const response = await fetchAISApi(path, params);
  return response.data ? (response.data as VesselAPIModel[]) : [];
}

export async function fetchAISFeatureCollection(path: string, params: Record<string, string>) {
  const response = await fetchAISApi(path, params);
  return response.data
    ? (response.data as VesselLocationFeatureCollection)
    : ({ type: 'FeatureCollection', features: [] } as VesselLocationFeatureCollection);
}

function getVatuAPIVersion(api: string): string {
  //During transition phase between V1 and V2, separate different environments support for API
  const version2Apis: string[] = ['navigointilinjat', 'turvalaite'];
  return !isProductionEnvironment() && version2Apis.includes(api) ? '-v2' : '';
}

export async function fetchVATUByApi<T extends GeometryModel | VaylaGeojsonFeature | VaylaAPIModel>(
  api: string,
  params: Record<string, string> = {}
) {
  const url = `${await getVatuUrl()}${getVatuAPIVersion(api)}/${api}`;
  log.debug({ api, url }, `VATU api: ${api}, url=${url}`);

  const start = Date.now();
  const response = await axios
    .get(url, {
      headers: await getVatuHeaders(),
      params,
      timeout: getTimeout(),
    })
    .catch(function (error) {
      const errorObj = error.toJSON();
      log.fatal(
        `${ExternalAPI.VATU} api /${api} fetch failed: params=%o status=%d code=%s message=%s`,
        params,
        errorObj.status,
        errorObj.code,
        errorObj.message
      );
      throw new Error(getFetchErrorMessage(ExternalAPI.VATU));
    });
  log.debug(`/${api} response time: ${Date.now() - start} ms`);

  if ('features' in response.data) {
    //The type of the response is Geojson
    for (const obj of response.data.features as T[]) {
      if ('geometry' in obj) {
        roundGeometry(obj.geometry);
      }
    }
  } else {
    for (const obj of response.data as T[]) {
      if ('geometria' in obj) {
        roundGeometry(obj.geometria as Geometry);
      }
    }
  }
  return response;
}

export async function fetchMarineWarnings() {
  const start = Date.now();
  const response = await axios
    .get(await getPookiUrl(), {
      headers: await getPookiHeaders(),
      timeout: getTimeout(),
    })
    .catch(function (error) {
      const errorObj = error.toJSON();
      log.fatal(`${ExternalAPI.POOKI} api fetch failed: status=%d code=%s message=%s`, errorObj.status, errorObj.code, errorObj.message);
      throw new Error(getFetchErrorMessage(ExternalAPI.POOKI));
    });
  const duration = Date.now() - start;
  log.debug({ duration }, `Pooki response time: ${duration} ms`);
  if (response?.data) {
    for (const feature of (response.data as FeatureCollection).features) {
      roundGeometry(feature.geometry);
    }
  }
  return response;
}

export async function fetchWeatherApi<T>(path: string) {
  const [soaApiUrl, weatherHeaders] = await Promise.all([getSOAApiUrl(), getWeatherHeaders()]);
  const start = Date.now();
  const response = await axios
    .get(`https://${soaApiUrl}/fmi/${path}`, {
      headers: weatherHeaders,
      timeout: getTimeout(),
    })
    .catch(function (error) {
      const errorObj = error.toJSON();
      log.fatal(`${ExternalAPI.WEATHER} api %s fetch failed: status=%d code=%s message=%s`, path, errorObj.status, errorObj.code, errorObj.message);
      throw new Error(getFetchErrorMessage(ExternalAPI.WEATHER));
    });
  const duration = Date.now() - start;
  log.debug({ duration }, `Weather api ${path} response time: ${duration} ms`);
  return response.data ? (response.data as T[]) : [];
}

export async function fetchIlmanetApi(): Promise<string> {
  const [url, username, password, weatherHeaders] = await Promise.all([
    getIlmanetUrl(),
    getIlmanetUsername(),
    getIlmanetPassword(),
    getWeatherHeaders(),
  ]);
  const start = Date.now();
  const response = await axios
    .get(url, {
      params: {
        username: username,
        password: password,
        orderId: 165689,
      },
      headers: weatherHeaders,
      timeout: getTimeout(),
    })
    .catch(function (error) {
      const errorObj = error.toJSON();
      log.fatal(`${ExternalAPI.ILMANET} api fetch failed: status=%d code=%s message=%s`, errorObj.status, errorObj.code, errorObj.message);
      throw new Error(getFetchErrorMessage(ExternalAPI.ILMANET));
    });
  const duration = Date.now() - start;
  log.debug({ duration }, `Ilmanet api response time: ${duration} ms`);
  return response.data;
}

export async function fetchIBNetApi<T>(path?: string, params?: Record<string, string>) {
  const url = `${await getIBNetApiUrl()}${path ?? ''}`;
  const start = Date.now();
  const response = await axios
    .get(url, {
      headers: await getVatuHeaders(),
      params: params ?? [],
      timeout: getTimeout(),
    })
    .catch(function (error) {
      const errorObj = error.toJSON();
      log.fatal(`${ExternalAPI.IBNET} api %s fetch failed: status=%d code=%s message=%s`, path, errorObj.status, errorObj.code, errorObj.message);
      throw new Error(getFetchErrorMessage(ExternalAPI.IBNET));
    });
  const duration = Date.now() - start;
  log.debug({ duration }, `${ExternalAPI.IBNET} api response time: ${duration} ms`);
  return response.data ? (response.data as T) : null;
}

async function getParameterFromStore(path: string): Promise<string | undefined> {
  const url = `http://localhost:${getExtensionPort()}/systemsmanager/parameters/get/?name=${path}&withDecryption=true`;
  const start = Date.now();
  const response = await axios
    .get(url, {
      headers: { 'X-Aws-Parameters-Secrets-Token': process.env.AWS_SESSION_TOKEN as string },
    })
    .catch(function (error) {
      const errorObj = error.toJSON();
      if (errorObj.status === 400) {
        log.warn(`Parameter ${path} cache fetch failed:`, errorObj.message);
        throw new Error(errorObj.message);
      }
      log.error(`Parameter cache fetch failed: status=%d code=%s message=%s`, errorObj.status, errorObj.code, errorObj.message);
    });
  log.debug(`Parameter cache response time: ${Date.now() - start} ms`);
  if (response?.data) {
    return response.data.Parameter.Value;
  }
  return undefined;
}

export async function readParameterByPath(path: string): Promise<string | undefined> {
  const maxAttempts = 2;
  let attempt = 1;

  const executeWithRetries = async (): Promise<string | undefined> => {
    try {
      return await getParameterFromStore(path);
    } catch (e: unknown) {
      if (attempt < maxAttempts) {
        attempt++;
        return executeWithRetries();
      }
      log.error(`Getting parameter ${path} failed after ${maxAttempts} attempts`);
      return undefined;
    }
  };

  return executeWithRetries();
}
