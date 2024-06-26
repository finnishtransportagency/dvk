import { Position, Feature, FeatureCollection, GeoJsonProperties, Geometry } from 'geojson';
import { Dirway, DirwayPoint, IBNetApiResponse, LocationApiModel, RestrictionApiModel } from './apiModels';
import { fetchIBNetApi } from './axios';
import { log } from '../logger';

export const DIRWAY_PATH = 'dirway';
export const DIRWAY_POINT_PATH = 'dirwaypoint';
export const LOCATION_PATH = 'location';
export const RESTRICTION_PATH = 'restriction';

type Point = {
  orderNumber: number;
  coordinates: number[];
};

type Restriction = {
  description: string;
  startTime: Date;
  endTime?: Date;
};

function mapPoints(dirwayPoints: DirwayPoint[]): Point[] {
  return dirwayPoints.map((p) => {
    return {
      orderNumber: p.order_num,
      coordinates: [p.longitude, p.latitude],
    };
  });
}

function addDirwayFeatures(features: Feature<Geometry, GeoJsonProperties>[], apiDirwayPoints: DirwayPoint[], apiDirways: Dirway[]) {
  // Sort dirways and points by change time so latest are first (API can return duplicates for the same id)
  const dirways = apiDirways.filter((d) => !d.deleted).sort((a, b) => Date.parse(b.change_time) - Date.parse(a.change_time));
  const dirwayPoints = apiDirwayPoints.filter((d) => !d.deleted).sort((a, b) => Date.parse(b.change_time) - Date.parse(a.change_time));
  // Remove duplicate restrictions (first in array remains)
  const uniquePoints = dirwayPoints.filter((val, index, arr) => arr.findIndex((l) => l.id === val.id) === index);

  const dirwayMap = new Map<string, DirwayPoint[]>();
  for (const p of uniquePoints) {
    dirwayMap.set(p.dirway_id, (dirwayMap.get(p.dirway_id) ?? []).concat(p));
  }
  for (const points of dirwayMap.values()) {
    const id = points[0].dirway_id;
    const coordinates = points.sort((a, b) => a.order_num - b.order_num).map((p) => [p.longitude, p.latitude] as Position);
    const dirway = dirways.find((d) => d.id === id); // Finds first in array

    if (dirway) {
      const properties = {
        id: id,
        name: dirway.name,
        description: dirway.description,
        updated: dirway.change_time,
        points: mapPoints(points),
        featureType: 'dirway',
      };

      features.push({
        type: 'Feature',
        id: id,
        geometry: { type: 'LineString', coordinates: coordinates },
        properties: properties,
      });
    }
  }
}

export async function fetchDirways(): Promise<FeatureCollection> {
  const features: Feature<Geometry, GeoJsonProperties>[] = [];

  // First fetch root of the API to get max toRV value
  const apiResponse: IBNetApiResponse | null = await fetchIBNetApi<IBNetApiResponse>();
  const { toRv } = apiResponse ?? {};

  if (toRv) {
    const params = { from: '0', to: toRv };
    const dirways: Dirway[] | null = await fetchIBNetApi<Dirway[]>(DIRWAY_PATH, params);
    const dirwayPoints: DirwayPoint[] | null = await fetchIBNetApi<DirwayPoint[]>(DIRWAY_POINT_PATH, params);

    if (dirways && dirwayPoints) {
      addDirwayFeatures(features, dirwayPoints, dirways);
    }
  } else {
    log.error('Could not get toRv from IBNetApi, not fetching dirway data');
  }

  const collection: FeatureCollection = {
    type: 'FeatureCollection',
    features: features,
  };
  return collection;
}

function mapRestrictions(restrictions: RestrictionApiModel[]): Restriction[] {
  return restrictions.map((r) => {
    return {
      description: r.text_compilation,
      startTime: new Date(r.start_time),
      endTime: r.end_time ? new Date(r.end_time) : undefined,
      updated: r.change_time,
    };
  });
}

function addRestrictionFeatures(
  features: Feature<Geometry, GeoJsonProperties>[],
  apiLocations: LocationApiModel[],
  apiRestrictions: RestrictionApiModel[]
) {
  // Sort locations and restrictions by change time so latest are first (API can return duplicates for the same id)
  const locations = apiLocations
    .filter((l) => !l.deleted && l.type === 'PORT' && l.nationality === 'FI')
    .sort((a, b) => Date.parse(b.change_time) - Date.parse(a.change_time));
  const restrictions = apiRestrictions.filter((r) => !r.deleted).sort((a, b) => Date.parse(b.change_time) - Date.parse(a.change_time));
  // Remove duplicate restrictions (first in array remains)
  const uniqueRestrictions = restrictions.filter((val, index, arr) => arr.findIndex((l) => l.id === val.id) === index);

  const locationMap = new Map<string, RestrictionApiModel[]>();
  for (const r of uniqueRestrictions) {
    locationMap.set(r.location_id, (locationMap.get(r.location_id) ?? []).concat(r));
  }
  for (const r of locationMap.values()) {
    const locationId = r[0].location_id;
    const location = locations.find((l) => l.id === locationId); // Finds first in array

    if (location) {
      const properties = {
        id: locationId,
        name: location.name,
        updated: location.change_time,
        restrictions: mapRestrictions(r),
        featureType: 'restrictionport',
      };

      features.push({
        type: 'Feature',
        id: locationId,
        geometry: { type: 'Point', coordinates: [location.longitude, location.latitude] },
        properties: properties,
      });
    }
  }
}

export async function fetchRestrictions(): Promise<FeatureCollection> {
  const features: Feature<Geometry, GeoJsonProperties>[] = [];
  const apiResponse: IBNetApiResponse | null = await fetchIBNetApi<IBNetApiResponse>();
  const { toRv } = apiResponse ?? {};

  if (toRv) {
    const params = { from: '0', to: toRv };
    const locations: LocationApiModel[] | null = await fetchIBNetApi<LocationApiModel[]>(LOCATION_PATH, params);
    const restrictions: RestrictionApiModel[] | null = await fetchIBNetApi<RestrictionApiModel[]>(RESTRICTION_PATH, params);

    if (locations && restrictions) {
      addRestrictionFeatures(features, locations, restrictions);
    }
  } else {
    log.error('Could not get toRv from IBNetApi, not fetching restriction data');
  }

  const collection: FeatureCollection = {
    type: 'FeatureCollection',
    features: features,
  };
  return collection;
}
