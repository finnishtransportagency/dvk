import { AppSyncResolverEvent } from 'aws-lambda/trigger/appsync-resolver';
import { PilotPlace } from '../../../../graphql/generated';
import PilotPlaceDBModel from '../../db/pilotPlaceDBModel';
import { log } from '../../logger';

export const handler = async (event: AppSyncResolverEvent<void>): Promise<PilotPlace[]> => {
  log.info(`pilotPlaces(${event.identity})`);
  const pilots = await PilotPlaceDBModel.getAll();
  log.debug('%d pilot place(s) found', pilots.length);
  return pilots;
};
