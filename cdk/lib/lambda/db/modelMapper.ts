import { FeatureCollection } from 'geojson';
import {
  Fairway,
  FairwayCard,
  GeometryInput,
  Harbor,
  InputMaybe,
  Maybe,
  OperationError,
  PilotPlace,
  TextInput,
  TrafficService,
} from '../../../graphql/generated';
import { CurrentUser } from '../api/login';
import { fetchPilotPoints } from '../api/traficom';
import { getFromCache, cacheResponse, CacheResponse } from '../graphql/cache';
import { log } from '../logger';
import FairwayCardDBModel, { FairwayDBModel, PilotRoute, TemporaryNotification, TrafficServiceDBModel } from './fairwayCardDBModel';
import HarborDBModel from './harborDBModel';
import { fetchPilotRouteData } from '../api/pilotRoutes';
import { saveResponseToS3 } from '../util';
import zlib from 'zlib';

const MAX_TEXT_LENGTH = 2000;
const MAX_NUMBER_LENGTH = 10;
// geometry allows only 5 decimals
const MAX_GEOMETRY_NUMBER_LENGTH = 8;

function checkLength(maxLength: number, ...text: string[]) {
  text.forEach((s) => {
    if (s && s.length > maxLength) {
      throw new Error(OperationError.InvalidInput);
    }
  });
}

export function mapNumber(text: Maybe<string> | undefined, maxLength = MAX_NUMBER_LENGTH): number | null {
  if (text) {
    checkLength(maxLength, text);
    const number = Number(text.replace(',', '.'));
    if (Number.isNaN(number)) {
      throw new Error(OperationError.InvalidInput);
    }
    if (text.trim().length > 0) {
      return number;
    }
  }
  return null;
}

export function mapGeometry(geometry?: InputMaybe<GeometryInput>, maxLength = MAX_GEOMETRY_NUMBER_LENGTH) {
  if (geometry?.lat && geometry.lon) {
    const geom = { type: 'Point', coordinates: [mapNumber(geometry.lon, maxLength), mapNumber(geometry.lat, maxLength)] };
    if (geom.coordinates[0] && geom.coordinates[1]) {
      if (geom.coordinates[0] >= 32 || geom.coordinates[0] < 17 || geom.coordinates[1] >= 70 || geom.coordinates[1] < 58) {
        throw new Error(OperationError.InvalidInput);
      }
      return geom;
    }
    throw new Error(OperationError.InvalidInput);
  }
  return null;
}

export function mapId(text?: Maybe<string>) {
  if (text && text.trim().length > 0) {
    checkLength(200, text);
    const m = /^[a-z]+[a-z\d]*$/.exec(text);
    if (m && m[0].length === text.length) {
      return text;
    }
  }
  throw new Error(OperationError.InvalidInput);
}

export function mapText(text?: Maybe<TextInput>, maxLength = MAX_TEXT_LENGTH) {
  if (text?.fi && text.sv && text.en) {
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

export function mapInternetAddress(text: Maybe<string> | undefined): string | null {
  return mapString(text, 200);
}

function checkRegExp(regexp: RegExp, text: string) {
  if (!regexp.test(text)) {
    throw new Error(OperationError.InvalidInput);
  }
}

export function mapEmail(text: Maybe<string> | undefined): string | null {
  if (text) {
    checkRegExp(
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
      text
    );
    return text;
  }
  return null;
}

export function mapEmails(text: Maybe<Maybe<string>[]> | undefined): string[] | null {
  return text ? text.map((t) => mapEmail(t)).filter((t) => t !== null) : null;
}

export function mapPhoneNumber(text: Maybe<string> | undefined): string | null {
  if (text) {
    checkRegExp(/^[+]?\d(\s?\d){4,19}$/, text);
    return text;
  }
  return null;
}

export function mapPhoneNumbers(text: Maybe<Maybe<string>[]> | undefined): string[] | null {
  return text ? text.map((t) => mapPhoneNumber(t)).filter((t) => t !== null) : null;
}

export function mapStringArray(text: Maybe<Maybe<string>[]> | undefined, maxLength = MAX_TEXT_LENGTH): string[] | null {
  return text ? text.map((t) => mapString(t, maxLength)).filter((t) => t !== null) : null;
}

export function mapIds(ids: number[]) {
  return `#${ids.join('#')}#`;
}

export function mapFairwayIds(dbModel: FairwayCardDBModel) {
  const fairways = dbModel.fairways;
  if (fairways) {
    return mapIds(fairways.map((f) => f.id));
  }
  return '';
}

function mapNumberAndMax(text: Maybe<string> | undefined, regexp: RegExp, maxValue: number) {
  if (text) {
    checkRegExp(regexp, text);
    const number = mapNumber(text);
    if (number && (number > maxValue || number < 0)) {
      throw new Error(OperationError.InvalidInput);
    }
    return number;
  }
  return null;
}

export function mapPilotJourney(text: Maybe<string> | undefined) {
  return mapNumberAndMax(text, /^\d{1,3}[.,]?\d?$/, 999.9);
}

export function mapVhfChannel(text: Maybe<string> | undefined) {
  return mapNumberAndMax(text, /^\d{1,3}$/, 999);
}

export function mapQuayLength(text: Maybe<string> | undefined) {
  return mapNumberAndMax(text, /^\d{1,4}[.,]?\d?$/, 9999.9);
}

export function mapQuayDepth(text: Maybe<string> | undefined) {
  return mapNumberAndMax(text, /^\d{1,3}[.,]?\d{0,2}$/, 999.99);
}

export function mapVersion(text?: Maybe<string>) {
  if (text && text.trim().length > 0) {
    const regex = /^v\d+(_(latest|public))?$/;
    const passedString = regex.exec(text);
    if (passedString && passedString[0].length === text.length) {
      return text;
    }
  }
  throw new Error(OperationError.InvalidInput);
}

export const pilotPlaceMap = new Map<number, PilotPlace>();
const pilotCacheKey = 'pilotplaces';

export async function getPilotPlaceMap() {
  if (pilotPlaceMap.size === 0) {
    let response: CacheResponse | undefined;
    let data: PilotPlace[] | undefined;
    try {
      response = await getFromCache(pilotCacheKey);
      if (response.expired) {
        log.debug('fetching pilot places from api');
        data = await fetchPilotPoints();
        await cacheResponse(pilotCacheKey, data);
      } else if (response.data) {
        log.debug('parsing pilot places from cache');
        data = JSON.parse(response.data) as PilotPlace[];
      }
    } catch (e) {
      if (!data && response?.data) {
        log.warn('parsing expired pilot places from cache');
        data = JSON.parse(response.data) as PilotPlace[];
      }
    }
    data?.forEach((p) => pilotPlaceMap.set(p.id, p));
  }
  return pilotPlaceMap;
}

function mapFairwayDBModelToFairway(dbModel: FairwayDBModel): Fairway {
  const fairway: Fairway = {
    id: dbModel.id,
    primary: dbModel.primary ?? false,
    primarySequenceNumber: dbModel.primarySequenceNumber,
    secondary: dbModel.secondary ?? false,
    secondarySequenceNumber: dbModel.secondarySequenceNumber,
  };
  return fairway;
}

function mapTrafficService(service: TrafficServiceDBModel | undefined | null, pilotMap: Map<number, PilotPlace>): TrafficService {
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
            name: pilotMap.get(p.id)?.name ?? { fi: '', sv: '', en: '' },
            geometry: pilotMap.get(p.id)?.geometry ?? { type: 'Point', coordinates: [] },
          };
        }) ?? [],
    },
    tugs: service?.tugs ?? null,
    vts: service?.vts ?? null,
  };
}

export function mapFairwayCardDBModelToGraphqlType(
  dbModel: FairwayCardDBModel,
  pilotMap: Map<number, PilotPlace>,
  user: CurrentUser | undefined,
  pilotRoutes: FeatureCollection
) {
  const card: FairwayCard = {
    id: dbModel.id,
    version: dbModel.version,
    currentPublic: dbModel.currentPublic,
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
    additionalInfo: dbModel.additionalInfo,
    lineText: dbModel.lineText,
    designSpeed: dbModel.designSpeed,
    navigationCondition: dbModel.navigationCondition,
    windRecommendation: dbModel.windRecommendation,
    visibility: dbModel.visibility,
    mareographs: dbModel.mareographs,
    speedLimit: dbModel.speedLimit,
    vesselRecommendation: dbModel.vesselRecommendation,
    trafficService: mapTrafficService(dbModel.trafficService, pilotMap),
    harbors: dbModel.harbors,
    pilotRoutes: mapPilotRoutes(dbModel.pilotRoutes ?? [], pilotRoutes),
    fairwayIds: mapFairwayIds(dbModel),
    pictures: dbModel.pictures,
    temporaryNotifications: mapTemporaryNotifications(dbModel.temporaryNotifications ?? []),
    latest: dbModel.latest,
    latestVersionUsed: dbModel.latestVersionUsed,
    publishDetails: dbModel.publishDetails,
  };

  if (card.fairways) {
    for (const fairway of dbModel.fairways || []) {
      card.fairways.push(mapFairwayDBModelToFairway(fairway));
    }
  }
  return card;
}

export function mapHarborDBModelToGraphqlType(dbModel: HarborDBModel, user: CurrentUser | undefined): Harbor {
  return {
    id: dbModel.id,
    version: dbModel.version,
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
    latest: dbModel.latest,
    latestVersionUsed: dbModel.latestVersionUsed,
    publishDetails: dbModel.publishDetails,
  };
}

const pilotRoutesCacheKey = 'pilotroutes';

export async function getPilotRoutes() {
  // get data (from cache or api)
  let response: CacheResponse | undefined;
  let data: FeatureCollection | undefined;
  try {
    response = await getFromCache(pilotRoutesCacheKey);
    if (response.expired) {
      log.debug('fetching pilot routes from api');
      data = await fetchPilotRouteData();
      await saveResponseToS3(data, pilotRoutesCacheKey);
    } else if (response.data) {
      log.debug('parsing pilot routes from cache');
      //data is compressed, so decompress before can be put in json form
      const decompressedData = zlib.unzipSync(Buffer.from(response.data, 'base64')).toString('utf-8');
      data = JSON.parse(decompressedData) as FeatureCollection;
    }
  } catch (e) {
    if (!data && response?.data) {
      log.warn('parsing expired pilot routes from cache');
      //data is compressed, so decompress before can be put in json form
      const decompressedData = zlib.unzipSync(Buffer.from(response.data, 'base64')).toString('utf-8');
      data = JSON.parse(decompressedData) as FeatureCollection;
    }
  }

  return data ?? [];
}

// map the routes to fit the db model
function mapPilotRoutes(pilotRoutes: PilotRoute[], features: FeatureCollection) {
  const filteredRoutes: PilotRoute[] = [];

  pilotRoutes.forEach((route) => {
    const foundFeature = features?.features?.find((f) => f.id === route.id);
    if (foundFeature) {
      filteredRoutes.push({
        id: route.id,
        name: foundFeature?.properties?.name,
      } as PilotRoute);
    }
  });
  // if empty array is returned, it means that routes are not found
  // from api or cache
  return filteredRoutes ?? [];
}

function mapTemporaryNotifications(notifications: TemporaryNotification[]) {
  return notifications.map((notification) => {
    return {
      content: notification.content,
      startDate: notification.startDate,
      endDate: notification.endDate,
    };
  });
}
