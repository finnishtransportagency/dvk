import { AppSyncResolverEvent, AppSyncResolverHandler } from 'aws-lambda/trigger/appsync-resolver';
import { Fairway, QueryFairwayArgs } from '../../../../graphql/generated';
import { log } from '../../logger';
import FairwayDBModel from '../../db/fairwayDBModel';
import { FairwayService } from '../../api/fairwayService';

const fairwayService = new FairwayService();

export const handler: AppSyncResolverHandler<QueryFairwayArgs, Fairway> = async (event: AppSyncResolverEvent<QueryFairwayArgs>): Promise<Fairway> => {
  log.info(`fairway(${event.arguments.id})`);
  const dbModel = await FairwayDBModel.get(event.arguments.id);
  const apiModel = fairwayService.getFairway(event.arguments.id);
  return fairwayService.mapModelsToFairway(apiModel, dbModel);
};
