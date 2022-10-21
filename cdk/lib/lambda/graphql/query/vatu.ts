import { ALBEvent } from 'aws-lambda';
import axios from 'axios';
import { getVatuHeaders, getVatuUrl } from '../../environment';
import { log } from '../../logger';

export async function fetchVATUByFairwayId<T>(fairwayId: number, api: string) {
  const start = Date.now();
  const response = await axios
    .get(`${await getVatuUrl()}/${api}?jnro=${fairwayId}`, {
      headers: await getVatuHeaders(),
    })
    .catch(function (error) {
      const errorObj = error.toJSON();
      log.fatal(`VATU /${api}?jnro=${fairwayId} fetch failed: status=%d code=%s message=%s`, errorObj.status, errorObj.code, errorObj.message);
    });
  log.debug(`/${api}?jnro=${fairwayId} response time: ${Date.now() - start} ms`);
  return response ? (response.data as T[]) : [];
}

export async function fetchVATUByFairwayClass<T>(api: string, event: ALBEvent) {
  const fairwayClass = event.queryStringParameters?.vaylaluokka || '1';
  const url = `${await getVatuUrl()}/${api}`;
  const start = Date.now();
  const response = await axios
    .get(url, {
      headers: await getVatuHeaders(),
      params: {
        vaylaluokka: fairwayClass,
      },
    })
    .catch(function (error) {
      const errorObj = error.toJSON();
      log.fatal(
        `VATU /${api}?fairwayClass=${fairwayClass} fetch failed: status=%d code=%s message=%s`,
        errorObj.status,
        errorObj.code,
        errorObj.message
      );
    });
  log.debug(`/${api}?fairwayClass=${fairwayClass} response time: ${Date.now() - start} ms`);
  return response ? (response.data as T[]) : [];
}
