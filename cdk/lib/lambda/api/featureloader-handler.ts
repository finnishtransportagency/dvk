import { ALBEvent, ALBResult } from 'aws-lambda';
import { getHeaders, getVatuHeaders, getVatuUrl } from '../environment';
import { log } from '../logger';
import { Feature, FeatureCollection, Geometry, GeoJsonProperties } from 'geojson';
import { vuosaariarea } from './sample/areas.json';
import FairwayCardDBModel, { PilotPlace } from '../db/fairwayCardDBModel';
import axios from 'axios';
import { NavigointiLinjaAPIModel } from '../graphql/query/fairwayNavigationLines-handler';
import { gzip } from 'zlib';
import { AlueAPIModel } from '../graphql/query/fairwayAreas-handler';

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

async function addAreaFeatures(features: Feature<Geometry, GeoJsonProperties>[], event: ALBEvent) {
  const fairwayClass = event.queryStringParameters?.vaylaluokka;
  if (!fairwayClass) {
    for (const area of vuosaariarea) {
      features.push({ type: 'Feature', geometry: area.geometry as Geometry, properties: { id: area.id, fairwayId: area.jnro } });
    }
  } else {
    const url = `${await getVatuUrl()}/vaylaalueet`;
    log.debug('url: %s', url);
    const response = await axios.get(url, {
      headers: await getVatuHeaders(),
      params: {
        bbox: '20,59,21,60',
        vaylaluokka: fairwayClass,
      },
    });
    const areas = response.data as AlueAPIModel[];
    log.debug('areas: %d', areas.length);
    log.debug('area: %o', areas[0]);
    for (const area of areas) {
      features.push({
        type: 'Feature',
        geometry: area.geometria as Geometry,
        properties: {
          id: area.id,
          name: area.nimi,
          draft: area.harausSyvyys,
          depth: area.mitoitusSyvays,
          n2000depth: area.n2000MitoitusSyvays,
          n2000draft: area.n2000HarausSyvyys,
          fairways: area.vayla?.map((v) => {
            return {
              fairwayId: v.jnro,
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
}

async function addLineFeatures(features: Feature<Geometry, GeoJsonProperties>[], event: ALBEvent) {
  const fairwayClass = event.queryStringParameters?.vaylaluokka || '1';
  const url = `${await getVatuUrl()}/navigointilinjat?vaylaluokka=${fairwayClass}`;
  log.debug('url: %s', url);
  const response = await axios.get(url, {
    headers: await getVatuHeaders(),
  });
  const lines = response.data as NavigointiLinjaAPIModel[];
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
            fairwayClass: Number(fairwayClass),
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
    await addAreaFeatures(features, event);
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
