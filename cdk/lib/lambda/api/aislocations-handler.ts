import { ALBEvent, ALBResult } from 'aws-lambda';
import { log } from '../logger';
import { fetchLocations } from './ais';
import { handleAisCall } from '../util';

export const handler = async (event: ALBEvent): Promise<ALBResult> => {
  log.info({ event }, `aislocations()`);
  return handleAisCall('aislocations', fetchLocations, ['application/geo+json']);
};
