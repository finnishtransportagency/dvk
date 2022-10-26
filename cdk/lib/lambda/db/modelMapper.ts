import { Fairway, FairwayCard } from '../../../graphql/generated';
import FairwayCardDBModel, { FairwayDBModel } from './fairwayCardDBModel';

export function mapFairwayIds(dbModel: FairwayCardDBModel) {
  return `#${dbModel.fairways?.map((f) => f.id).join('#')}#`;
}

function mapFairwayDBModelToFairway(dbModel: FairwayDBModel): Fairway {
  const fairway: Fairway = {
    id: dbModel.id,
    primary: dbModel.primary ?? false,
  };
  fairway.geotiffImages = dbModel.geotiffImages;
  return fairway;
}

export function mapFairwayCardDBModelToGraphqlType(dbModel: FairwayCardDBModel) {
  const card: FairwayCard = {
    id: dbModel.id,
    name: {
      fi: dbModel.name?.fi,
      sv: dbModel.name?.sv,
      en: dbModel.name?.en,
    },
    group: dbModel.group,
    modificationTimestamp: dbModel.modificationTimestamp,
    fairways: [],
    generalInfo: dbModel.generalInfo,
    anchorage: dbModel.anchorage,
    iceCondition: dbModel.iceCondition,
    attention: dbModel.attention,
    lineText: dbModel.lineText,
    designSpeed: dbModel.designSpeed,
    navigationCondition: dbModel.navigationCondition,
    windRecommendation: dbModel.windRecommendation,
    windGauge: dbModel.windGauge,
    visibility: dbModel.visibility,
    seaLevel: dbModel.seaLevel,
    speedLimit: dbModel.speedLimit,
    vesselRecommendation: dbModel.vesselRecommendation,
    trafficService: dbModel.trafficService,
    harbors: dbModel.harbors,
    fairwayIds: mapFairwayIds(dbModel),
  };
  for (const fairway of dbModel.fairways || []) {
    card.fairways.push(mapFairwayDBModelToFairway(fairway));
  }
  return card;
}
