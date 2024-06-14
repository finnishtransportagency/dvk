import { Feature, FeatureCollection, GeoJsonProperties, Geometry } from 'geojson';
import { Dirway, DirwayPoint, IBNetApiResponse } from './apiModels';
import { fetchIBNetApi } from './axios';
import { log } from '../logger';
import { Position } from '@turf/helpers';

export const DIRWAY_PATH = 'dirway';
export const DIRWAY_POINT_PATH = 'dirwaypoint';

function addDirwayFeatures(features: Feature<Geometry, GeoJsonProperties>[], dirwayPoints: DirwayPoint[], dirways: Dirway[]) {
  const dirwayMap = new Map<string, DirwayPoint[]>();
  for (const p of dirwayPoints) {
    if (!p.deleted) {
      dirwayMap.set(p.dirway_id, (dirwayMap.get(p.dirway_id) ?? []).concat(p));
    }
  }
  for (const points of dirwayMap.values()) {
    const id = points[0].dirway_id;
    const coordinates = points.sort((a, b) => a.order_num - b.order_num).map((p) => [p.longitude, p.latitude] as Position);
    const dirway = dirways.filter((d) => !d.deleted).find((d) => d.id === id);

    const properties = {
      id: id,
      name: dirway?.name,
      description: dirway?.description,
      updated: dirway?.change_time,
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
