import { AppSyncResolverEvent, AppSyncResolverHandler } from 'aws-lambda/trigger/appsync-resolver';
import { ContentType, FairwayCardOrHarbor, QueryFairwayCardsAndHarborsArgs, Status } from '../../../../graphql/generated';
import { getCurrentUser } from '../../api/login';
import FairwayCardDBModel from '../../db/fairwayCardDBModel';
import HarborDBModel from '../../db/harborDBModel';
import { log } from '../../logger';

export const handler: AppSyncResolverHandler<QueryFairwayCardsAndHarborsArgs, FairwayCardOrHarbor[]> = async (
  event: AppSyncResolverEvent<QueryFairwayCardsAndHarborsArgs>
): Promise<FairwayCardOrHarbor[]> => {
  const user = await getCurrentUser(event);
  const { getAllVersions } = event.arguments;
  log.info(`fairwayCardsAndHarbors(${user.uid})`);
  const fairwayCardModels = getAllVersions ? await FairwayCardDBModel.getVersions() : await FairwayCardDBModel.getAllLatest();
  log.debug('%d fairway card(s) found', fairwayCardModels.length);
  const harborModels = getAllVersions ? await HarborDBModel.getVersions() : await HarborDBModel.getAllLatest();
  log.debug('%d harbor(s) found', harborModels.length);
  const cards: FairwayCardOrHarbor[] = fairwayCardModels.map((card) => {
    return {
      id: card.id,
      version: card.version ?? 'v1',
      n2000HeightSystem: card.n2000HeightSystem || false,
      name: card.name,
      type: ContentType.Card,
      group: card.group,
      status: card.status || Status.Public,
      fairwayIds: card.fairways.map((f) => f.id),
      creator: card.creator,
      modifier: card.modifier,
      modificationTimestamp: card.modificationTimestamp,
      temporaryNotifications: card.temporaryNotifications,
    };
  });
  const harbors: FairwayCardOrHarbor[] = harborModels.map((harbor) => {
    return {
      id: harbor.id,
      version: harbor.version ?? 'v1',
      n2000HeightSystem: harbor.n2000HeightSystem || false,
      name: harbor.name,
      type: ContentType.Harbor,
      status: harbor.status ?? Status.Public,
      creator: harbor.creator,
      modifier: harbor.modifier,
      modificationTimestamp: harbor.modificationTimestamp,
    };
  });
  return cards.concat(harbors);
};
