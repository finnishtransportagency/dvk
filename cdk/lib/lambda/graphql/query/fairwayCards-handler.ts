import { AppSyncResolverEvent } from 'aws-lambda/trigger/appsync-resolver';
import { FairwayCard } from '../../../../graphql/generated';
import FairwayCardDBModel from '../../db/fairwayCardDBModel';
import { getPilotPlaceMap, mapFairwayCardDBModelToGraphqlType } from '../../db/modelMapper';
import { log } from '../../logger';

export const handler = async (event: AppSyncResolverEvent<void>): Promise<FairwayCard[]> => {
  log.info(`fairwayCards(${event.identity})`);
  const fairwayCards = await FairwayCardDBModel.getAll();
  log.debug('fairwayCards: %o', fairwayCards);
  const pilotMap = await getPilotPlaceMap();
  return fairwayCards.map((fairwayCard) => {
    return mapFairwayCardDBModelToGraphqlType(fairwayCard, pilotMap);
  });
};
