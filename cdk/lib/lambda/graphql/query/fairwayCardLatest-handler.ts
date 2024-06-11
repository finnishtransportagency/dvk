import { AppSyncResolverEvent, AppSyncResolverHandler } from 'aws-lambda/trigger/appsync-resolver';
import { FairwayCard, QueryFairwayCardArgs } from '../../../../graphql/generated';
import { log } from '../../logger';
import FairwayCardDBModel from '../../db/fairwayCardDBModel';
import { getPilotPlaceMap, getPilotRoutes, mapFairwayCardDBModelToGraphqlType } from '../../db/modelMapper';
import { getOptionalCurrentUser } from '../../api/login';
import { FeatureCollection, GeoJsonProperties, Geometry } from 'geojson';

export const handler: AppSyncResolverHandler<QueryFairwayCardArgs, FairwayCard | undefined> = async (
  event: AppSyncResolverEvent<QueryFairwayCardArgs>
): Promise<FairwayCard | undefined> => {
  log.info(`fairwayCard(${event.arguments.id})`);
  const pilotMap = await getPilotPlaceMap();
  const pilotRoutes = (await getPilotRoutes()) as FeatureCollection<Geometry, GeoJsonProperties>;
  const dbModel = await FairwayCardDBModel.getLatest(event.arguments.id);
  if (dbModel) {
    const user = await getOptionalCurrentUser(event);
    return mapFairwayCardDBModelToGraphqlType(dbModel, pilotMap, user, pilotRoutes);
  }
  return undefined;
};