import { AppSyncResolverEvent, AppSyncResolverHandler } from 'aws-lambda/trigger/appsync-resolver';
import { FairwayCard, QueryFairwayCardArgs } from '../../../../graphql/generated';
import { log } from '../../logger';
import FairwayCardDBModel from '../../db/fairwayCardDBModel';
import { mapFairwayCardDBModelToGraphqlType } from '../../db/modelMapper';

export const handler: AppSyncResolverHandler<QueryFairwayCardArgs, FairwayCard | undefined> = async (
  event: AppSyncResolverEvent<QueryFairwayCardArgs>
): Promise<FairwayCard | undefined> => {
  log.info(`fairwayCard(${event.arguments.id})`);
  const dbModel = await FairwayCardDBModel.get(event.arguments.id);
  if (dbModel) {
    return mapFairwayCardDBModelToGraphqlType(dbModel);
  }
  return undefined;
};
