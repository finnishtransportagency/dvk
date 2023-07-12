import axios from 'axios';
import { getSOAApiUrl, getTimeout, getTraficomHeaders } from '../environment';
import { log } from '../logger';
import { FeatureCollection } from 'geojson';

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
