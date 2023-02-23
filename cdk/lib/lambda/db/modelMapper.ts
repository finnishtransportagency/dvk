import { Fairway, FairwayCard, TrafficService } from '../../../graphql/generated';
import FairwayCardDBModel, { FairwayDBModel, TrafficServiceDBModel } from './fairwayCardDBModel';
import PilotPlaceDBModel from './pilotPlaceDBModel';

export function mapFairwayIds(dbModel: FairwayCardDBModel | FairwayCard) {
  return `#${dbModel.fairways?.map((f) => f.id).join('#')}#`;
}

const pilotPlaceMap = new Map<number, PilotPlaceDBModel>();

export async function getPilotPlaceMap() {
  if (pilotPlaceMap.size === 0) {
    (await PilotPlaceDBModel.getAll()).forEach((p) => pilotPlaceMap.set(p.id, p));
  }
  return pilotPlaceMap;
}

function mapFairwayDBModelToFairway(dbModel: FairwayDBModel): Fairway {
  const fairway: Fairway = {
    id: dbModel.id,
    primary: dbModel.primary ?? false,
  };
  fairway.geotiffImages = dbModel.geotiffImages;
  return fairway;
}

function mapTrafficService(service: TrafficServiceDBModel | undefined, pilotMap: Map<number, PilotPlaceDBModel>): TrafficService {
  return {
    pilot: {
      email: service?.pilot?.email,
      extraInfo: service?.pilot?.extraInfo,
      fax: service?.pilot?.fax,
      internet: service?.pilot?.internet,
      phoneNumber: service?.pilot?.phoneNumber,
      places:
        service?.pilot?.places?.map((p) => {
          return {
            id: p.id,
            pilotJourney: p.pilotJourney,
            name: pilotMap.get(p.id)?.name || '',
            geometry: pilotMap.get(p.id)?.geometry || { type: 'Point', coordinates: [] },
          };
        }) || [],
    },
    tugs: service?.tugs,
    vts: service?.vts,
  };
}

export function mapFairwayCardDBModelToGraphqlType(dbModel: FairwayCardDBModel, pilotMap: Map<number, PilotPlaceDBModel>) {
  const card: FairwayCard = {
    id: dbModel.id,
    name: {
      fi: dbModel.name?.fi,
      sv: dbModel.name?.sv,
      en: dbModel.name?.en,
    },
    n2000HeightSystem: !!dbModel.n2000HeightSystem,
    group: dbModel.group,
    creator: dbModel.creator,
    creationTimestamp: dbModel.creationTimestamp,
    modifier: dbModel.modifier,
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
    trafficService: mapTrafficService(dbModel.trafficService, pilotMap),
    harbors: dbModel.harbors,
    fairwayIds: mapFairwayIds(dbModel),
  };
  for (const fairway of dbModel.fairways || []) {
    card.fairways.push(mapFairwayDBModelToFairway(fairway));
  }
  return card;
}
