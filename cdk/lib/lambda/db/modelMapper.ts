import { Fairway, FairwayCard, Harbor, Maybe, OperationError, TextInput, TrafficService } from '../../../graphql/generated';
import { CurrentUser } from '../api/login';
import FairwayCardDBModel, { FairwayDBModel, TrafficServiceDBModel } from './fairwayCardDBModel';
import HarborDBModel from './harborDBModel';
import PilotPlaceDBModel from './pilotPlaceDBModel';

const MAX_TEXT_LENGTH = 2000;

function checkLength(maxLength: number, ...text: string[]) {
  text.forEach((s) => {
    if (s && s.length > maxLength) {
      throw new Error(OperationError.InvalidInput);
    }
  });
}

export function mapText(text?: Maybe<TextInput>, maxLength = MAX_TEXT_LENGTH) {
  if (text && text.fi && text.sv && text.en) {
    checkLength(maxLength, text.fi, text.sv, text.en);
    return {
      fi: text.fi,
      sv: text.sv,
      en: text.en,
    };
  } else if (text && (text.fi || text.sv || text.en)) {
    throw new Error(OperationError.InvalidInput);
  } else {
    return null;
  }
}

export function mapMandatoryText(text?: TextInput, maxLength = MAX_TEXT_LENGTH) {
  if (text?.fi && text?.sv && text?.en) {
    checkLength(maxLength, text.fi, text.sv, text.en);
    return {
      fi: text.fi,
      sv: text.sv,
      en: text.en,
    };
  } else {
    throw new Error(OperationError.InvalidInput);
  }
}

export function mapString(text: Maybe<string> | undefined, maxLength = MAX_TEXT_LENGTH): string | null {
  if (text) {
    checkLength(maxLength, text);
    return text;
  }
  return null;
}

export function mapNumber(text: Maybe<number> | undefined): number | null {
  return text ?? null;
}

export function mapStringArray(text: Maybe<Maybe<string>[]> | undefined, maxLength = MAX_TEXT_LENGTH): string[] | null {
  return text ? (text.map((t) => mapString(t, maxLength)).filter((t) => t !== null) as string[]) : null;
}

export function mapIds(ids: number[]) {
  return `#${ids.join('#')}#`;
}

export function mapFairwayIds(dbModel: FairwayCardDBModel) {
  return mapIds(dbModel.fairways.map((f) => f.id));
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
    secondary: dbModel.secondary ?? false,
  };
  return fairway;
}

function mapTrafficService(service: TrafficServiceDBModel | undefined | null, pilotMap: Map<number, PilotPlaceDBModel>): TrafficService {
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
            name: pilotMap.get(p.id)?.name || { fi: '', sv: '', en: '' },
            geometry: pilotMap.get(p.id)?.geometry || { type: 'Point', coordinates: [] },
          };
        }) || [],
    },
    tugs: service?.tugs || null,
    vts: service?.vts || null,
  };
}

export function mapFairwayCardDBModelToGraphqlType(
  dbModel: FairwayCardDBModel,
  pilotMap: Map<number, PilotPlaceDBModel>,
  user: CurrentUser | undefined
) {
  const card: FairwayCard = {
    id: dbModel.id,
    name: {
      fi: dbModel.name?.fi,
      sv: dbModel.name?.sv,
      en: dbModel.name?.en,
    },
    n2000HeightSystem: !!dbModel.n2000HeightSystem,
    status: dbModel.status,
    group: dbModel.group,
    creator: user ? dbModel.creator : null,
    creationTimestamp: dbModel.creationTimestamp,
    modifier: user ? dbModel.modifier : null,
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

export function mapHarborDBModelToGraphqlType(dbModel: HarborDBModel, user: CurrentUser | undefined): Harbor {
  return {
    id: dbModel.id,
    cargo: dbModel.cargo,
    company: dbModel.company,
    creator: user ? dbModel.creator : null,
    creationTimestamp: dbModel.creationTimestamp,
    email: dbModel.email,
    extraInfo: dbModel.extraInfo,
    fax: dbModel.fax,
    geometry: dbModel.geometry,
    harborBasin: dbModel.harborBasin,
    internet: dbModel.internet,
    modifier: user ? dbModel.modifier : null,
    modificationTimestamp: dbModel.modificationTimestamp,
    n2000HeightSystem: dbModel.n2000HeightSystem,
    name: dbModel.name,
    phoneNumber: dbModel.phoneNumber,
    quays: dbModel.quays,
    status: dbModel.status,
  };
}
