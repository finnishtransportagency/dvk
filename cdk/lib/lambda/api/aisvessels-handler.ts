import { ALBEvent, ALBResult } from 'aws-lambda';
import { log } from '../logger';
import { fetchVessels } from './ais';
import { handleAisCall } from '../util';

export const handler = async (event: ALBEvent): Promise<ALBResult> => {
  log.info({ event }, `aisvessels()`);
  return handleAisCall('aisvessels', fetchVessels, ['application/json']);
};
