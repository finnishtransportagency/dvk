import { AppSyncResolverEvent, AppSyncResolverHandler } from 'aws-lambda/trigger/appsync-resolver';
import { FairwayCard, QueryFairwayCardArgs } from '../../../../graphql/generated';
import { log } from '../../logger';
import FairwayCardDBModel from '../../db/fairwayCardDBModel';
import { FairwayService } from '../../api/fairwayService';

const fairwayService = new FairwayService();

export const handler: AppSyncResolverHandler<QueryFairwayCardArgs, FairwayCard | undefined> = async (
  event: AppSyncResolverEvent<QueryFairwayCardArgs>
): Promise<FairwayCard | undefined> => {
  log.info(`fairwayCard(${event.arguments.id})`);
  const dbModel = await FairwayCardDBModel.get(event.arguments.id);
  if (dbModel) {
    const card: FairwayCard = {
      id: dbModel.id,
      name: {
        fi: dbModel.name?.fi || '',
        sv: dbModel.name?.sv || '',
        en: dbModel.name?.en || '',
      },
      fairways: [],
    };
    for (const fairway of dbModel?.fairways || []) {
      card.fairways.push(fairwayService.mapModelsToFairway(undefined, fairway));
    }
    return card;
  }
  return undefined;
};
