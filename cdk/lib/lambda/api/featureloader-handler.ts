import { ALBEvent, ALBResult } from 'aws-lambda';
import { getHeaders } from '../environment';
import { log } from '../logger';
import { Feature, FeatureCollection, Geometry, GeoJsonProperties } from 'geojson';
import FairwayCardDBModel, { PilotPlace } from '../db/fairwayCardDBModel';
import { NavigointiLinjaAPIModel } from '../graphql/query/fairwayNavigationLines-handler';
import { gzip } from 'zlib';
import { AlueAPIModel } from '../graphql/query/fairwayAreas-handler';
import { RajoitusAlueAPIModel } from '../graphql/query/fairwayRestrictionAreas-handler';
import { fetchVATUByFairwayClass } from '../graphql/query/vatu';

const gzipString = async (input: string): Promise<Buffer> => {
  const buffer = Buffer.from(input);
  return new Promise((resolve, reject) =>
    gzip(buffer, (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(data);
    })
  );
};

async function addPilotFeatures(features: Feature<Geometry, GeoJsonProperties>[]) {
  const placeMap = new Map<number, PilotPlace>();
  const cards = await FairwayCardDBModel.getAll();
  for (const card of cards) {
    const pilot = card.trafficService?.pilot;
    if (pilot) {
      for (const place of pilot.places) {
        if (!placeMap.has(place.id)) {
          placeMap.set(place.id, place);
          place.fairwayCards = [];
        }
        placeMap.get(place.id)?.fairwayCards?.push({ id: card.id, name: card.name });
      }
    }
  }
  for (const place of placeMap.values()) {
    features.push({
      type: 'Feature',
      geometry: place.geometry as Geometry,
      properties: {
        type: 'pilot',
        name: place.name,
        fairwayCards: place.fairwayCards,
      },
    });
  }
}

async function addAreaFeatures(features: Feature<Geometry, GeoJsonProperties>[], navigationArea: boolean, event: ALBEvent) {
  const areas = await fetchVATUByFairwayClass<AlueAPIModel>('vaylaalueet', event);
  log.debug('areas: %d', areas.length);
  for (const area of areas.filter((a) =>
    navigationArea ? a.tyyppiKoodi === 1 || a.tyyppiKoodi === 4 : a.tyyppiKoodi !== 1 && a.tyyppiKoodi !== 4
  )) {
    features.push({
      type: 'Feature',
      geometry: area.geometria as Geometry,
      properties: {
        id: area.id,
        name: area.nimi,
        draft: area.harausSyvyys,
        typeCode: area.tyyppiKoodi,
        type: area.tyyppi,
        depth: area.mitoitusSyvays,
        n2000depth: area.n2000MitoitusSyvays,
        n2000draft: area.n2000HarausSyvyys,
        fairways: area.vayla?.map((v) => {
          return {
            fairwayId: v.jnro,
            name: {
              fi: v.nimiFI,
              sv: v.nimiSV,
            },
            status: v.status,
            line: v.linjaus,
            sizingSpeed: v.mitoitusNopeus,
            sizingSpeed2: v.mitoitusNopeus2,
          };
        }),
      },
    });
  }
}

async function addRestrictionAreaFeatures(features: Feature<Geometry, GeoJsonProperties>[], event: ALBEvent) {
  const areas = await fetchVATUByFairwayClass<RajoitusAlueAPIModel>('rajoitusalueet', event);
  log.debug('areas: %d', areas.length);
  for (const area of areas) {
    const feature: Feature<Geometry, GeoJsonProperties> = {
      type: 'Feature',
      geometry: area.geometria as Geometry,
      properties: {
        id: area.id,
        value: area.suuruus,
        types:
          area.rajoitustyypit?.map((t) => {
            return { code: t.koodi, text: t.rajoitustyyppi };
          }) || [],
        exception: area.poikkeus,
        fairways: area.vayla?.map((v) => {
          return {
            fairwayId: v.jnro,
            name: {
              fi: v.nimiFI,
              sv: v.nimiSV,
            },
          };
        }),
      },
    };
    if (area.rajoitustyyppi) {
      feature.properties?.types.push({ text: area.rajoitustyyppi });
    }
    features.push(feature);
  }
}

async function addLineFeatures(features: Feature<Geometry, GeoJsonProperties>[], event: ALBEvent) {
  const lines = await fetchVATUByFairwayClass<NavigointiLinjaAPIModel>('navigointilinjat', event);
  log.debug('lines: %d', lines.length);
  for (const line of lines) {
    features.push({
      type: 'Feature',
      geometry: line.geometria as Geometry,
      properties: {
        id: line.id,
        draft: line.harausSyvyys,
        depth: line.mitoitusSyvays,
        type: line.tyyppi,
        typeCode: line.tyyppiKoodi,
        fairways: line.vayla?.map((v) => {
          return {
            fairwayId: v.jnro,
            name: {
              fi: v.nimiFi,
              sv: v.nimiSv,
            },
            status: v.status,
            line: v.linjaus,
          };
        }),
      },
    });
  }
}

export const handler = async (event: ALBEvent): Promise<ALBResult> => {
  log.info({ event }, `featureloader()`);
  const features: Feature<Geometry, GeoJsonProperties>[] = [];
  const types = event.queryStringParameters?.type?.split(',') || [];
  if (types.includes('pilot')) {
    await addPilotFeatures(features);
  }
  if (types.includes('area')) {
    await addAreaFeatures(features, true, event);
  }
  if (types.includes('specialarea')) {
    await addAreaFeatures(features, false, event);
  }
  if (types.includes('restrictionarea')) {
    await addRestrictionAreaFeatures(features, event);
  }
  if (types.includes('line')) {
    await addLineFeatures(features, event);
  }
  const collection: FeatureCollection = {
    type: 'FeatureCollection',
    features,
  };
  const body = JSON.stringify(collection);
  const gzippedResponse = await gzipString(body);
  return {
    statusCode: 200,
    body: gzippedResponse.toString('base64'),
    isBase64Encoded: true,
    headers: { ...getHeaders(), 'Content-Type': 'application/geo+json' },
  };
};
