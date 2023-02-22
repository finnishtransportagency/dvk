import { AppSyncResolverEvent } from 'aws-lambda/trigger/appsync-resolver';
import { Fairway } from '../../../../graphql/generated';
import { log } from '../../logger';
import { mapAPIModelToFairway } from './fairwayCardFairways-handler';
import { VaylaAPIModel, fetchVATUByApi } from './vatu';

export const handler = async (event: AppSyncResolverEvent<void>): Promise<Fairway[]> => {
  log.info(`fairways(${event.identity})`);
  const fairways = await fetchVATUByApi<VaylaAPIModel>('vaylat', { vaylaluokka: '1,2' });
  log.debug('%d fairway(s) found', fairways.length);
  return fairways.map((apiFairway) => {
    return {
      ...mapAPIModelToFairway(apiFairway),
    };
  });
};
