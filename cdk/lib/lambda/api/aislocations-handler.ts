import { ALBEvent, ALBResult } from 'aws-lambda';
import { getHeaders } from '../environment';
import { log } from '../logger';
import { getFromCache } from '../graphql/cache';
import { fetchLocations } from './ais';
import { handleLoaderError, saveResponseToS3 } from '../util';

function getKey() {
  return 'aislocations';
}

export const handler = async (event: ALBEvent): Promise<ALBResult> => {
  log.info({ event }, `aislocations()`);
  const key = getKey();
  let base64Response: string | undefined;
  let statusCode = 200;
  try {
    const featureCollection = await fetchLocations();
    log.debug('ais locations: %d', featureCollection.features.length);
    base64Response = await saveResponseToS3(featureCollection, key);
  } catch (e) {
    const response = await getFromCache(key);
    const errorResult = handleLoaderError(response, e);
    base64Response = errorResult.body;
    statusCode = errorResult.statusCode;
  }
  return {
    statusCode,
    body: base64Response,
    isBase64Encoded: true,
    multiValueHeaders: {
      ...getHeaders(),
      'Content-Type': ['application/geo+json'],
    },
  };
};