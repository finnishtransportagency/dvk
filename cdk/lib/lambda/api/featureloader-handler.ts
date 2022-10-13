import { ALBEvent, ALBResult } from 'aws-lambda';
import { getHeaders, getVatuHeaders, getVatuUrl } from '../environment';
import { log } from '../logger';
import { Feature, FeatureCollection, Geometry, GeoJsonProperties } from 'geojson';
import { vuosaariarea } from './sample/areas.json';
import FairwayCardDBModel from '../db/fairwayCardDBModel';
import axios from 'axios';
import { NavigointiLinjaAPIModel } from '../graphql/query/fairwayNavigationLines-handler';
import { gzip } from 'zlib';

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
            name: pilot.name,
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
