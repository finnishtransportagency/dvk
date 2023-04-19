import { AppSyncResolverEvent } from 'aws-lambda/trigger/appsync-resolver';
import { PilotPlace } from '../../../../graphql/generated';
import { log } from '../../logger';
import { fetchPilotPoints } from '../../api/traficom';

export const handler = async (event: AppSyncResolverEvent<void>): Promise<PilotPlace[]> => {
  log.info(`pilotPlaces(${event.identity})`);
  const pilots = await fetchPilotPoints();
  log.debug('%d pilot place(s) found', pilots.length);
  return pilots;
};
