import { Vessel } from '../../../graphql/generated';
import { AppSyncResolverEvent } from 'aws-lambda';
import { log } from '../logger';
import { cacheResponse, getFromCache } from '../graphql/cache';
import { fetchVessels } from './ais';

function getKey() {
  return 'vessel';
}

export const handler = async (event: AppSyncResolverEvent<void>): Promise<Vessel[]> => {
  log.info(`vessels(${event.identity})`);
  const key = getKey();
  try {
    const vessels = await fetchVessels();
    log.debug('vessels: %d', vessels.length);
    await cacheResponse(key, vessels);
    return vessels;
  } catch (e) {
    log.error('Getting vessels failed: %s', e);
    const cacheResponseData = await getFromCache(key);
    if (cacheResponseData.data) {
      log.warn('Returning expired response from s3 cache');
      return JSON.parse(cacheResponseData.data);
    } else {
      throw e;
    }
  }
};
