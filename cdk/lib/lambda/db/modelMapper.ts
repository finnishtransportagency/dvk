import { FairwayCard } from '../../../graphql/generated';
import { FairwayService } from '../api/fairwayService';
import FairwayCardDBModel from './fairwayCardDBModel';

const fairwayService = new FairwayService();

export function mapFairwayCardDBModelToGraphqlType(dbModel: FairwayCardDBModel) {
  const card: FairwayCard = {
    id: dbModel.id,
    name: {
      fi: dbModel.name?.fi,
      sv: dbModel.name?.sv,
      en: dbModel.name?.en,
    },
    fairways: [],
    anchorage: dbModel.anchorage,
    iceCondition: dbModel.iceCondition,
    lineText: dbModel.lineText,
    navigationCondition: dbModel.navigationCondition,
    windRecommendation: dbModel.windRecommendation,
    windGauge: dbModel.windGauge,
    visibility: dbModel.visibility,
    seaLevel: dbModel.seaLevel,
    speedLimit: dbModel.speedLimit,
    vesselRecommendation: dbModel.vesselRecommendation,
    trafficService: dbModel.trafficService,
    harbor: dbModel.harbor,
  };
  for (const fairway of dbModel?.fairways || []) {
    card.fairways.push(fairwayService.mapDBModelToFairway(fairway));
  }
  return card;
}
