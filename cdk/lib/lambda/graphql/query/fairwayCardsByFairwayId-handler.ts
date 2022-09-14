import { AppSyncResolverEvent, AppSyncResolverHandler } from 'aws-lambda/trigger/appsync-resolver';
import { FairwayCard, QueryFairwayCardsByFairwayIdArgs } from '../../../../graphql/generated';
import { log } from '../../logger';
import FairwayCardDBModel from '../../db/fairwayCardDBModel';
import { mapFairwayCardDBModelToGraphqlType } from '../../db/modelMapper';

export const handler: AppSyncResolverHandler<QueryFairwayCardsByFairwayIdArgs, FairwayCard[]> = async (
  event: AppSyncResolverEvent<QueryFairwayCardsByFairwayIdArgs>
): Promise<FairwayCard[]> => {
  log.info(`fairwayCardsByFairwayId(${event.arguments.id})`);
  const fairwayCards = await FairwayCardDBModel.findByFairwayId(event.arguments.id);
  return fairwayCards.map((fairwayCard) => {
    return mapFairwayCardDBModelToGraphqlType(fairwayCard);
  });
};
