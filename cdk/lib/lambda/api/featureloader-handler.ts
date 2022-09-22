import { ALBEvent, ALBResult } from 'aws-lambda';
import { getHeaders } from '../environment';
import { log } from '../logger';
import { NavigationLinesService } from './navigationLinesService';
import { Feature, FeatureCollection, Geometry, GeoJsonProperties } from 'geojson';

const linesService = new NavigationLinesService();

export const handler = async (event: ALBEvent): Promise<ALBResult> => {
  log.info({ event }, `featureloader()`);
  const features: Feature<Geometry, GeoJsonProperties>[] = [];
  for (const line of linesService.getNavigationLines()) {
    features.push({ type: 'Feature', geometry: line.geometry, properties: { id: line.id, draft: line.harausSyvyys } });
  }
  const collection: FeatureCollection = { type: 'FeatureCollection', features };
  return {
    statusCode: 200,
    body: JSON.stringify(collection),
    headers: getHeaders(),
  };
};
