import axios from 'axios';
import { getPookiHeaders, getPookiUrl } from '../environment';
import { log } from '../logger';
import { FeatureCollection } from 'geojson';

export type PookiResponse = {
  status: number;
  data?: FeatureCollection;
};

export async function fetchMarineWarnings(): Promise<PookiResponse> {
  const start = Date.now();
  let status = 200;
  const response = await axios
    .get(await getPookiUrl(), {
      headers: await getPookiHeaders(),
    })
    .catch(function (error) {
      const errorObj = error.toJSON();
      status = errorObj.status;
      log.fatal(`Pooki fetch failed: status=%d code=%s message=%s`, errorObj.status, errorObj.code, errorObj.message);
    });
  log.debug(`Pooki response time: ${Date.now() - start} ms`);
  return response ? { status, data: response.data as FeatureCollection } : { status };
}
