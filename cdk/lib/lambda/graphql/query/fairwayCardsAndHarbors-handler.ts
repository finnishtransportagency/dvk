import { AppSyncResolverEvent } from 'aws-lambda/trigger/appsync-resolver';
import { FairwayCardOrHarbor } from '../../../../graphql/generated';
import FairwayCardDBModel from '../../db/fairwayCardDBModel';
import HarborDBModel from '../../db/harborDBModel';
import { log } from '../../logger';

export const handler = async (event: AppSyncResolverEvent<void>): Promise<FairwayCardOrHarbor[]> => {
  log.info(`fairwayCardsAndHarbors(${event.identity})`);
  const fairwayCardModels = await FairwayCardDBModel.getAll();
  log.debug('%d fairway card(s) found', fairwayCardModels.length);
  const harborModels = await HarborDBModel.getAll();
  log.debug('%d harbor(s) found', harborModels.length);
  const cards: FairwayCardOrHarbor[] = fairwayCardModels.map((card) => {
    return {
      id: card.id,
      n2000HeightSystem: card.n2000HeightSystem || false,
      name: card.name,
      type: 1,
      group: card.group,
      status: 1,
      fairwayIds: card.fairways.map((f) => f.id),
      creator: undefined,
      modifier: undefined,
      modificationTimestamp: card.modificationTimestamp,
    };
  });
  const harbors: FairwayCardOrHarbor[] = harborModels.map((harbor) => {
    return {
      id: harbor.id,
      n2000HeightSystem: false,
      name: harbor.name,
      type: 2,
      status: 1,
      creator: undefined,
      modifier: undefined,
      modificationTimestamp: undefined,
    };
  });
  return cards.concat(harbors);
};
