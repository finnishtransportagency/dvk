import { AppSyncResolverEvent, AppSyncResolverHandler } from 'aws-lambda';
import { FairwayCard, Harbor, QueryFairwayCardArgs } from '../../../../graphql/generated';
import { getOptionalCurrentUser } from '../../api/login';
import HarborDBModel from '../../db/harborDBModel';
import { mapHarborDBModelToGraphqlType } from '../../db/modelMapper';
import { log } from '../../logger';

export const handler: AppSyncResolverHandler<QueryFairwayCardArgs, Harbor[], FairwayCard> = async (
  event: AppSyncResolverEvent<QueryFairwayCardArgs, FairwayCard>
): Promise<Harbor[]> => {
  log.info(`fairwayCardHarbors(${event.source.id})`);
  const harborIds = event.source.harbors?.map((h) => h.id);
  log.debug(`harborIds: ${harborIds}`);
  const harbors: Harbor[] = [];
  const user = await getOptionalCurrentUser(event);
  for (const id of harborIds || []) {
    const model = await HarborDBModel.getPublic(id);
    if (model) {
      harbors.push(mapHarborDBModelToGraphqlType(model, user));
    }
  }
  return harbors;
};
