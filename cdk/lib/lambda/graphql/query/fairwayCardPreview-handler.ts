import { AppSyncResolverEvent, AppSyncResolverHandler } from 'aws-lambda/trigger/appsync-resolver';
import { FairwayCard, QueryFairwayCardPreviewArgs, Status } from '../../../../graphql/generated';
import { auditLog as log } from '../../logger';
import FairwayCardDBModel from '../../db/fairwayCardDBModel';
import { getPilotPlaceMap, getPilotRoutes, mapFairwayCardDBModelToGraphqlType } from '../../db/modelMapper';
import { ADMIN_ROLE, getOptionalCurrentUser } from '../../api/login';
import { FeatureCollection, GeoJsonProperties, Geometry } from 'geojson';

export const handler: AppSyncResolverHandler<QueryFairwayCardPreviewArgs, FairwayCard | undefined> = async (
  event: AppSyncResolverEvent<QueryFairwayCardPreviewArgs>
): Promise<FairwayCard | undefined> => {
  log.info(`fairwayCardPreview(${event.arguments.id})`);
  const user = await getOptionalCurrentUser(event);

  if (user?.roles.includes(ADMIN_ROLE)) {
    const pilotMap = await getPilotPlaceMap();
    const pilotRoutes = (await getPilotRoutes()) as FeatureCollection<Geometry, GeoJsonProperties>;
    const dbModel = await FairwayCardDBModel.getVersion(event.arguments.id, event.arguments.version);

    if (dbModel?.status === Status.Draft || dbModel?.status === Status.Public) {
      return mapFairwayCardDBModelToGraphqlType(dbModel, pilotMap, user, pilotRoutes);
    }
  } else {
    log.error(`User missing required role ${ADMIN_ROLE}`);
  }

  return undefined;
};
