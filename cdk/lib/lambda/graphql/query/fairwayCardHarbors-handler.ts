import { AppSyncResolverEvent, AppSyncResolverHandler } from 'aws-lambda';
import { FairwayCard, Harbor, QueryFairwayCardArgs } from '../../../../graphql/generated';
import HarborDBModel from '../../db/harborDBModel';
import { log } from '../../logger';

export const handler: AppSyncResolverHandler<QueryFairwayCardArgs, Harbor[], FairwayCard> = async (
  event: AppSyncResolverEvent<QueryFairwayCardArgs, FairwayCard>
): Promise<Harbor[]> => {
  log.info(`fairwayCardHarbors(${event.source.id})`);
  const harborIds = event.source.harbors?.map((h) => h?.id) as string[] | undefined;
  log.debug(`harborIds: ${harborIds}`);
  return (
    harborIds?.map((id) => {
      const harbor = HarborDBModel.get(id);
      log.debug('Harbor: %o', harbor);
      return harbor as Harbor;
    }) || []
  );
};
