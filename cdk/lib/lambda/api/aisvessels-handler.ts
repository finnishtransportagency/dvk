import { ALBEvent, ALBResult } from 'aws-lambda';
import { getHeaders } from '../environment';
import { log } from '../logger';
import { getFromCache } from '../graphql/cache';
import { fetchVessels } from './ais';
import { handleLoaderError, saveResponseToS3 } from '../util';

function getKey() {
  return 'aisvessels';
}

export const handler = async (event: ALBEvent): Promise<ALBResult> => {
  log.info({ event }, `aisvessels()`);
  const key = getKey();
  let base64Response: string | undefined;
  let statusCode = 200;
  const response = await getFromCache(key);
  if (!response.expired && response.data) {
    base64Response = response.data;
  } else {
    try {
      const vessels = await fetchVessels();
      log.debug('ais vessels: %d', vessels.length);
      base64Response = await saveResponseToS3(vessels, key);
    } catch (e) {
      const errorResult = handleLoaderError(response, e);
      base64Response = errorResult.body;
      statusCode = errorResult.statusCode;
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
