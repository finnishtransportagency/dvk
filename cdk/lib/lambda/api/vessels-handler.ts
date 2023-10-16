import { ALBEvent, ALBResult } from 'aws-lambda';
import { getHeaders } from '../environment';
import { log } from '../logger';
import { cacheResponse, getFromCache } from '../graphql/cache';
import { fetchVessels } from './ais';
import { gzipString } from '../util';

function getKey() {
  return 'vessel';
}

export const handler = async (event: ALBEvent): Promise<ALBResult> => {
  log.info({ event }, `vessels()`);
  const key = getKey();
  let base64Response: string | undefined;
  let statusCode = 200;
  const response = await getFromCache('vessel');
  if (!response.expired && response.data) {
    base64Response = response.data;
  } else {
    try {
      const vessels = await fetchVessels();
      log.debug('vessels: %d', vessels.length);
      const body = JSON.stringify(vessels);
      const gzippedResponse = await gzipString(body);
      base64Response = gzippedResponse.toString('base64');
      await cacheResponse(key, vessels);
    } catch (e) {
      log.error('Getting vessels failed: %s', e);
      if (response.data) {
        log.warn('Returning possibly expired response from s3 cache');
        return JSON.parse(response.data);
      } else {
        base64Response = undefined;
        statusCode = 500;
      }
    }
  }
  return {
    statusCode,
    body: base64Response,
    isBase64Encoded: true,
    multiValueHeaders: {
      ...getHeaders(),
      'Content-Type': ['application/json'],
    },
  };
};
