import { AppSyncResolverEvent } from 'aws-lambda/trigger/appsync-resolver';
import { FairwayCard, QueryFairwayCardsArgs, Status } from '../../../../graphql/generated';
import { getOptionalCurrentUser } from '../../api/login';
import FairwayCardDBModel from '../../db/fairwayCardDBModel';
import { getPilotPlaceMap, getPilotRoutes, mapFairwayCardDBModelToGraphqlType } from '../../db/modelMapper';
import { log } from '../../logger';
import { FeatureCollection, GeoJsonProperties, Geometry } from 'geojson';

export const handler = async (event: AppSyncResolverEvent<QueryFairwayCardsArgs>): Promise<FairwayCard[]> => {
  log.info(`fairwayCards(${event.arguments.status})`);
  const fairwayCards = event.arguments.status?.every((s) => s === Status.Public)
    ? await FairwayCardDBModel.getAllPublic()
    : (await FairwayCardDBModel.getAllLatest()).filter((card) =>
        event.arguments.status?.length && event.arguments.status.length > 0 ? event.arguments.status.includes(card.status) : true
      );
  log.debug('%d filtered fairway card(s) found', fairwayCards.length);
  const pilotMap = await getPilotPlaceMap();
  const pilotRoutes = (await getPilotRoutes()) as FeatureCollection<Geometry, GeoJsonProperties>;
  const user = await getOptionalCurrentUser(event);
  return fairwayCards.map((fairwayCard) => {
    return mapFairwayCardDBModelToGraphqlType(fairwayCard, pilotMap, user, pilotRoutes);
  });
};
