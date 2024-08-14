import { AppSyncResolverEvent, AppSyncResolverHandler } from 'aws-lambda/trigger/appsync-resolver';
import { FairwayCard, QueryFairwayCardArgs, Status } from '../../../../graphql/generated';
import { log } from '../../logger';
import FairwayCardDBModel from '../../db/fairwayCardDBModel';
import { getPilotPlaceMap, getPilotRoutes, mapFairwayCardDBModelToGraphqlType } from '../../db/modelMapper';
import { ADMIN_ROLE, getOptionalCurrentUser } from '../../api/login';
import { FeatureCollection, GeoJsonProperties, Geometry } from 'geojson';

export const handler: AppSyncResolverHandler<QueryFairwayCardArgs, FairwayCard | undefined> = async (
  event: AppSyncResolverEvent<QueryFairwayCardArgs>
): Promise<FairwayCard | undefined> => {
  const { id, version, status } = event.arguments;
  log.info(`fairwayCard(${id})`);

  const user = await getOptionalCurrentUser(event);
  const pilotMap = await getPilotPlaceMap();
  const pilotRoutes = (await getPilotRoutes()) as FeatureCollection<Geometry, GeoJsonProperties>;
  let dbModel;

  if (!version && status?.every((s) => s === Status.Public)) {
    // Get the latest (only) public card
    dbModel = await FairwayCardDBModel.getPublic(id);
  } else if (user?.roles.includes(ADMIN_ROLE)) {
    // Only public cards allowed without admin role
    if (version) {
      dbModel = await FairwayCardDBModel.getVersion(id, version);
    } else {
      dbModel = await FairwayCardDBModel.getLatest(id);
    }
  } else {
    log.error(`User missing required role ${ADMIN_ROLE}`);
  }

  if (dbModel) {
    return mapFairwayCardDBModelToGraphqlType(dbModel, pilotMap, user, pilotRoutes);
  }
  return undefined;
};
