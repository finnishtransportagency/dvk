import { AppSyncResolverEvent } from 'aws-lambda/trigger/appsync-resolver';
import { FairwayCard, QueryFairwayCardsArgs } from '../../../../graphql/generated';
import FairwayCardDBModel from '../../db/fairwayCardDBModel';
import { getPilotPlaceMap, mapFairwayCardDBModelToGraphqlType } from '../../db/modelMapper';
import { log } from '../../logger';

export const handler = async (event: AppSyncResolverEvent<QueryFairwayCardsArgs>): Promise<FairwayCard[]> => {
  log.info(`fairwayCards(${event.arguments.status})`);
  const fairwayCards = (await FairwayCardDBModel.getAll()).filter((card) =>
    event.arguments.status && card.status ? event.arguments.status.includes(card.status) : true
  );
  log.debug('%d filtered fairway card(s) found', fairwayCards.length);
  const pilotMap = await getPilotPlaceMap();
  return fairwayCards.map((fairwayCard) => {
    return mapFairwayCardDBModelToGraphqlType(fairwayCard, pilotMap);
  });
};
