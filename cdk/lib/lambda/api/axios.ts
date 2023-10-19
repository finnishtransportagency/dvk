import axios from 'axios';
import {
  getAISHeaders,
  getExtensionPort,
  getIlmanetPassword,
  getIlmanetUrl,
  getIlmanetUsername,
  getPookiHeaders,
  getPookiUrl,
  getSOAApiUrl,
  getTimeout,
  getTraficomHeaders,
  getVatuHeaders,
  getVatuUrl,
  getWeatherHeaders,
} from '../environment';
import { log } from '../logger';
import { FeatureCollection, Geometry } from 'geojson';
import { roundGeometry } from '../util';
import { GeometryModel, VaylaAPIModel, VesselAPIModel, VesselLocationFeatureCollection } from './apiModels';

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
      log.fatal(`Traficom api %s fetch failed: status=%d code=%s message=%s`, path, errorObj.status, errorObj.code, errorObj.message);
      throw new Error('Fetching from Traficom api failed');
    });
  const duration = Date.now() - start;
  log.debug({ duration }, `Traficom api response time: ${duration} ms`);
  return response.data ? (response.data as T) : ({ type: 'FeatureCollection', features: [] } as FeatureCollection);
}

async function fetchAISApi(path: string) {
  const url = `https://${await getSOAApiUrl()}/${path}`;
  const start = Date.now();
  const response = await axios
    .get(url, {
      headers: await getAISHeaders(),
      timeout: getTimeout(),
    })
    .catch(function (error) {
      const errorObj = error.toJSON();
      log.fatal(`AIS api %s fetch failed: status=%d code=%s message=%s`, path, errorObj.status, errorObj.code, errorObj.message);
      throw new Error('Fetching from AIS api failed');
    });
  const duration = Date.now() - start;
  log.debug({ duration }, `AIS api response time: ${duration} ms`);
  return response;
}

export async function fetchAISMetadata(path: string) {
  const response = await fetchAISApi(path);
  return response.data ? (response.data as VesselAPIModel[]) : [];
}

export async function fetchAISFeatureCollection(path: string) {
  const response = await fetchAISApi(path);
  return response.data
    ? (response.data as VesselLocationFeatureCollection)
    : ({ type: 'FeatureCollection', features: [] } as VesselLocationFeatureCollection);
}

export async function fetchVATUByApi<T extends GeometryModel | VaylaAPIModel>(api: string, params: Record<string, string> = {}) {
  const url = `${await getVatuUrl()}/${api}`;
  const start = Date.now();
  const response = await axios
    .get(url, {
      headers: await getVatuHeaders(),
      params,
      timeout: getTimeout(),
    })
    .catch(function (error) {
      const errorObj = error.toJSON();
      log.fatal(`VATU /${api} fetch failed: params=%o status=%d code=%s message=%s`, params, errorObj.status, errorObj.code, errorObj.message);
      throw new Error('Fetching from VATU failed');
    });
  log.debug(`/${api} response time: ${Date.now() - start} ms`);
  const datas = response ? (response.data as T[]) : [];
  for (const obj of datas) {
    if ('geometria' in obj) {
      roundGeometry(obj.geometria as Geometry);
    }
  }
  return datas;
}

export async function fetchMarineWarnings(): Promise<FeatureCollection> {
  const start = Date.now();
  const response = await axios
    .get(await getPookiUrl(), {
      headers: await getPookiHeaders(),
      timeout: getTimeout(),
    })
    .catch(function (error) {
      const errorObj = error.toJSON();
      log.fatal(`Pooki fetch failed: status=%d code=%s message=%s`, errorObj.status, errorObj.code, errorObj.message);
      throw new Error('Fetching from Pooki failed');
    });
  const duration = Date.now() - start;
  log.debug({ duration }, `Pooki response time: ${duration} ms`);
  if (response?.data) {
    for (const feature of (response.data as FeatureCollection).features) {
      roundGeometry(feature.geometry);
    }
  }
  return response.data as FeatureCollection;
}

export async function fetchWeatherApi<T>(path: string) {
  const url = `https://${await getSOAApiUrl()}/fmi/${path}`;
  const start = Date.now();
  const response = await axios
    .get(url, {
      headers: await getWeatherHeaders(),
      timeout: getTimeout(),
    })
    .catch(function (error) {
      const errorObj = error.toJSON();
      log.fatal(`Weather api %s fetch failed: status=%d code=%s message=%s`, path, errorObj.status, errorObj.code, errorObj.message);
      throw new Error('Fetching from Weather api failed');
    });
  const duration = Date.now() - start;
  log.debug({ duration }, `Weather api ${path} response time: ${duration} ms`);
  return response.data ? (response.data as T[]) : [];
}

export async function fetchIlmanetApi(): Promise<string> {
  const start = Date.now();
  const response = await axios
    .get(await getIlmanetUrl(), {
      params: {
        username: await getIlmanetUsername(),
        password: await getIlmanetPassword(),
        orderId: 165689,
      },
      headers: await getWeatherHeaders(),
      timeout: getTimeout(),
    })
    .catch(function (error) {
      const errorObj = error.toJSON();
      log.fatal(`Ilmanet api fetch failed: status=%d code=%s message=%s`, errorObj.status, errorObj.code, errorObj.message);
      throw new Error('Fetching from Ilmanet api failed');
    });
  const duration = Date.now() - start;
  log.debug({ duration }, `Ilmanet api response time: ${duration} ms`);
  return response.data;
}

export async function readParameterByPath(path: string): Promise<string | undefined> {
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
