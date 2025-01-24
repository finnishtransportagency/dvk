import axios from 'axios';
import {
  getAISParameters,
  getExtensionPort,
  getIBNetApiParameters,
  getIlmanetParameters,
  getPookiParameters,
  getSOAApiParameters,
  getTimeout,
  getVatuParameters,
  getVatuPilotRoutesParameters,
} from '../environment';
import { log } from '../logger';
import { FeatureCollection } from 'geojson';
import { roundGeometry } from '../util';
import { VaylaGeojsonFeature, RtzData, VesselAPIModel, VesselLocationFeatureCollection, VaylaFeature } from './apiModels';

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
  const { soaApiUrl, weatherHeaders } = await getSOAApiParameters();
  const url = `https://${soaApiUrl}/${path}`;
  const start = Date.now();
  const response = await axios
    .get(url, {
      headers: weatherHeaders,
      timeout: getTimeout(),
    })
    .catch(function (error) {
      if (error.code === 'ECONNABORTED') {
        log.fatal(`${ExternalAPI.TRAFICOM} api %s fetch timeout: message=%s`, path, error.message);
      } else {
        const errorObj = error.toJSON();
        log.fatal(
          `${ExternalAPI.TRAFICOM} api %s fetch failed: status=%d code=%s message=%s`,
          path,
          errorObj.status,
          errorObj.code,
          errorObj.message
        );
      }
      throw new Error(getFetchErrorMessage(ExternalAPI.TRAFICOM));
    });
  const duration = Date.now() - start;
  log.debug({ duration }, `Traficom api response time: ${duration} ms`);
  return response.data ? (response.data as T) : ({ type: 'FeatureCollection', features: [] } as FeatureCollection);
}

export async function fetchPilotRoutesApi() {
  const { vatuPilotRoutesUrl, vatuHeaders } = await getVatuPilotRoutesParameters();
  const start = Date.now();
  const response = await axios
    .get(vatuPilotRoutesUrl, {
      headers: vatuHeaders,
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
  const { soaApiUrl, aisHeaders } = await getAISParameters();
  const url = `https://${soaApiUrl}/${path}`;
  const start = Date.now();
  const response = await axios
    .get(url, {
      headers: aisHeaders,
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

export async function fetchVATUByApi<T extends VaylaGeojsonFeature | VaylaFeature>(api: string, params: Record<string, string> = {}) {
  const { vatuUrl, vatuHeaders } = await getVatuParameters();

  const url = `${vatuUrl}/${api}`;
  log.debug({ api, url }, `VATU api: ${api}, url=${url}`);

  const start = Date.now();
  const response = await axios
    .get(url, {
      headers: vatuHeaders,
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

  for (const obj of response.data.features as T[]) {
    if ('geometry' in obj) {
      roundGeometry(obj.geometry);
    }
  }
  return response;
}

export async function fetchMarineWarnings() {
  const { pookiUrl, pookiHeaders } = await getPookiParameters();
  const start = Date.now();
  const response = await axios
    .get(pookiUrl, {
      headers: pookiHeaders,
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
  const response = await fetchWeatherApiResponse(path);
  return response.data ? (response.data as T[]) : [];
}

export async function fetchWeatherApiResponse(path: string) {
  const { soaApiUrl, weatherHeaders } = await getSOAApiParameters();
  const start = Date.now();
  log.debug(`Weather api https://${soaApiUrl}/fmi/${path} called`);
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
  return response;
}

export async function fetchIlmanetApi(): Promise<string> {
  const { ilmanetUrl, ilmanetUserName, ilmanetPassword, weatherHeaders } = await getIlmanetParameters();
  const start = Date.now();
  const response = await axios
    .get(ilmanetUrl, {
      params: {
        username: ilmanetUserName,
        password: ilmanetPassword,
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
  const { ibNetApiUrl, vatuHeaders } = await getIBNetApiParameters();
  const url = `${ibNetApiUrl}${path ?? ''}`;
  const start = Date.now();
  const response = await axios
    .get(url, {
      headers: vatuHeaders,
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
