import { AppSyncResolverEvent, AppSyncResolverHandler } from 'aws-lambda/trigger/appsync-resolver';
import { FairwayCard, QueryFairwayCardVersionArgs } from '../../../../graphql/generated';
import { log } from '../../logger';
import FairwayCardDBModel from '../../db/fairwayCardDBModel';
import { getPilotPlaceMap, getPilotRoutes, mapFairwayCardDBModelToGraphqlType } from '../../db/modelMapper';
import { getOptionalCurrentUser } from '../../api/login';
import { FeatureCollection, GeoJsonProperties, Geometry } from 'geojson';

export const handler: AppSyncResolverHandler<QueryFairwayCardVersionArgs, FairwayCard | undefined> = async (
  event: AppSyncResolverEvent<QueryFairwayCardVersionArgs>
): Promise<FairwayCard | undefined> => {
  log.info(`fairwayCard(${event.arguments.id})`);
  const pilotMap = await getPilotPlaceMap();
  const pilotRoutes = (await getPilotRoutes()) as FeatureCollection<Geometry, GeoJsonProperties>;
  const dbModel = await FairwayCardDBModel.getVersion(event.arguments.id, event.arguments.version);
  if (dbModel) {
    const user = await getOptionalCurrentUser(event);
    return mapFairwayCardDBModelToGraphqlType(dbModel, pilotMap, user, pilotRoutes);
  }
  return undefined;
};
