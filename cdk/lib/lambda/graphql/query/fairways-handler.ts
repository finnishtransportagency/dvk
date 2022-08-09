import { AppSyncResolverEvent } from 'aws-lambda/trigger/appsync-resolver';
import { Fairway } from '../../../../graphql/generated';
import { FairwayService } from '../../api/fairwayService';
import FairwayDBModel from '../../db/fairwayDBModel';
import { log } from '../../logger';

const fairwayService = new FairwayService();

export const handler = async (event: AppSyncResolverEvent<void>): Promise<Fairway[]> => {
  log.info(`fairways(${event.identity})`);
  const fairways = await FairwayDBModel.getAll();
  log.debug('fairways: %o', fairways);
  const dbModelMap = new Map<number, FairwayDBModel>();
  fairways.forEach((fairway) => {
    dbModelMap.set(fairway.id, fairway);
  });
  return fairwayService.getFairways().map((apiModel) => {
    return fairwayService.mapModelsToFairway(apiModel, dbModelMap.get(apiModel.jnro));
  });
};
