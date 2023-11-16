import { AppSyncResolverEvent, AppSyncResolverHandler } from 'aws-lambda/trigger/appsync-resolver';
import { FairwayCard, QueryFairwayCardPreviewArgs, Status } from '../../../../graphql/generated';
import { log } from '../../logger';
import FairwayCardDBModel from '../../db/fairwayCardDBModel';
import { getPilotPlaceMap, mapFairwayCardDBModelToGraphqlType } from '../../db/modelMapper';
import { ADMIN_ROLE, getOptionalCurrentUser } from '../../api/login';

export const handler: AppSyncResolverHandler<QueryFairwayCardPreviewArgs, FairwayCard | undefined> = async (
  event: AppSyncResolverEvent<QueryFairwayCardPreviewArgs>
): Promise<FairwayCard | undefined> => {
  log.info(`fairwayCard(${event.arguments.id})`);
  const user = await getOptionalCurrentUser(event);

  if (user?.roles.includes(ADMIN_ROLE)) {
    const pilotMap = await getPilotPlaceMap();
    const dbModel = await FairwayCardDBModel.get(event.arguments.id);

    if (dbModel?.status === Status.Draft || dbModel?.status === Status.Public) {
      return mapFairwayCardDBModelToGraphqlType(dbModel, pilotMap, user);
    }
  }

  return undefined;
};
