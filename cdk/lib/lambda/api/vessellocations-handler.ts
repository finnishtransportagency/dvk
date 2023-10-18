import { ALBEvent, ALBResult } from 'aws-lambda';
import { getHeaders } from '../environment';
import { log } from '../logger';
import { getFromCache } from '../graphql/cache';
import { fetchVesselLocations } from './ais';
import { handleLoaderError, saveResponseToS3 } from '../util';

function getKey() {
  return 'vessel-locations';
}

export const handler = async (event: ALBEvent): Promise<ALBResult> => {
  log.info({ event }, `vessel-locations()`);
  const key = getKey();
  let base64Response: string | undefined;
  let statusCode = 200;
  try {
    const featureCollection = await fetchVesselLocations();
    log.debug('vessel locations: %d', featureCollection.features.length);
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
