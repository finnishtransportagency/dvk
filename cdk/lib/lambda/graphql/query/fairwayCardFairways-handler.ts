import { AppSyncResolverEvent, AppSyncResolverHandler } from 'aws-lambda';
import { Fairway, FairwayCard, QueryFairwayCardArgs } from '../../../../graphql/generated';
import { FairwayService } from '../../api/fairwayService';
import { log } from '../../logger';

const fairwayService = new FairwayService();

export const handler: AppSyncResolverHandler<QueryFairwayCardArgs, Fairway[], FairwayCard> = async (
  event: AppSyncResolverEvent<QueryFairwayCardArgs, FairwayCard>
): Promise<Fairway[]> => {
  log.info(`fairwayCard(${event.source?.id})`);
  const fairwayMap = new Map<number, Fairway>();
  event.source.fairways.forEach((f) => {
    fairwayMap.set(f.id, f);
  });
  const fairways = fairwayService.getFairways().filter((v) => event.source.fairways.map((f) => f.id).includes(v.jnro));
  return fairways.map((apiFairway) => {
    const fairway = fairwayMap.get(apiFairway.jnro);
    return {
      ...fairwayService.mapModelsToFairway(apiFairway),
      ...fairway,
    };
  });
};
