import { AppSyncResolverEvent } from 'aws-lambda/trigger/appsync-resolver';
import { FairwayCard } from '../../../../graphql/generated';
import { FairwayService, VaylaAPIModel } from '../../api/fairwayService';
import FairwayCardDBModel from '../../db/fairwayCardDBModel';
import { log } from '../../logger';

const fairwayService = new FairwayService();

export const handler = async (event: AppSyncResolverEvent<void>): Promise<FairwayCard[]> => {
  log.info(`fairwayCards(${event.identity})`);
  const fairwayCards = await FairwayCardDBModel.getAll();
  log.debug('fairwayCards: %o', fairwayCards);
  const fairwayMap = new Map<number, VaylaAPIModel>();
  fairwayService.getFairways().forEach((fairway) => {
    fairwayMap.set(fairway.jnro, fairway);
  });
  return fairwayCards.map((fairwayCard) => {
    const card: FairwayCard = {
      id: fairwayCard.id,
      name: {
        fi: fairwayCard.name?.fi || '',
        sv: fairwayCard.name?.sv || '',
        en: fairwayCard.name?.en || '',
      },
      fairways: [],
    };
    for (const fairway of fairwayCard?.fairways || []) {
      const apiModel = fairwayMap.get(fairway.id);
      card.fairways.push(fairwayService.mapModelsToFairway(apiModel, fairway));
    }
    return card;
  });
};
