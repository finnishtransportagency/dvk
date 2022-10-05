import { ALBEvent, ALBResult } from 'aws-lambda';
import { getHeaders } from '../environment';
import { log } from '../logger';
import { Feature, FeatureCollection, Geometry, GeoJsonProperties } from 'geojson';
import { vuosaariarea } from './sample/areas.json';
import { vuosaari } from './sample/navigationLines.json';
import FairwayCardDBModel from '../db/fairwayCardDBModel';

export const handler = async (event: ALBEvent): Promise<ALBResult> => {
  log.info({ event }, `featureloader()`);
  const features: Feature<Geometry, GeoJsonProperties>[] = [];
  const types = event.queryStringParameters?.type?.split(',') || [];
  if (types.includes('pilot')) {
    const cards = await FairwayCardDBModel.getAll();
    cards.forEach((card) => {
      const pilot = card.trafficService?.pilot;
      if (pilot?.geometry?.coordinates) {
        features.push({
          type: 'Feature',
          geometry: pilot.geometry as Geometry,
          properties: {
            type: 'pilot',
            email: pilot.email,
            phoneNumber: pilot.phoneNumber,
            fax: pilot.fax,
            internet: pilot.internet,
            journey: pilot.pilotJourney,
            extraInfoFI: pilot.extraInfo?.fi,
            extraInfoSV: pilot.extraInfo?.sv,
            extraInfoEN: pilot.extraInfo?.en,
          },
        });
      }
    });
  }
  if (types.includes('area')) {
    for (const area of vuosaariarea) {
      features.push({ type: 'Feature', geometry: area.geometry as Geometry, properties: { id: area.id, fairwayId: area.jnro } });
    }
  }
  if (types.includes('line')) {
    for (const line of vuosaari) {
      features.push({
        type: 'Feature',
        geometry: line.geometry as Geometry,
        properties: { id: line.id, draft: line.harausSyvyys, fairwayId: line.jnro },
      });
    }
  }
  const collection: FeatureCollection = {
    type: 'FeatureCollection',
    features,
  };
  return {
    statusCode: 200,
    body: JSON.stringify(collection),
    headers: { ...getHeaders(), 'Content-Type': 'application/geo+json' },
  };
};
