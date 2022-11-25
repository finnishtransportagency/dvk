import { AppSyncResolverEvent, AppSyncResolverHandler } from 'aws-lambda';
import { FairwayCard, Harbor, QueryFairwayCardArgs } from '../../../../graphql/generated';
import HarborDBModel from '../../db/harborDBModel';
import { log } from '../../logger';

export const handler: AppSyncResolverHandler<QueryFairwayCardArgs, Harbor[], FairwayCard> = async (
  event: AppSyncResolverEvent<QueryFairwayCardArgs, FairwayCard>
): Promise<Harbor[]> => {
  log.info(`fairwayCardHarbors(${event.source.id})`);
  const harborIds = event.source.harbors?.map((h) => h.id);
  log.debug(`harborIds: ${harborIds}`);
  const harbors: Harbor[] = [];
  for (const id of harborIds || []) {
    harbors.push((await HarborDBModel.get(id)) as Harbor);
  }
  return harbors;
};
