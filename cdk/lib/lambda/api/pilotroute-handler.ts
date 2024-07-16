import { ALBEvent, ALBResult } from 'aws-lambda';
import { log } from '../logger';
import { fetchPilotRoutes } from './pilotRoutes';

export const handler = async (event: ALBEvent): Promise<ALBResult> => {
  log.info({ event }, `pilotroutes()`);
  return fetchPilotRoutes();
};
