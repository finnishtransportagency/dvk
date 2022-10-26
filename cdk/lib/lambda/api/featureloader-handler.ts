import { ALBEvent, ALBEventQueryStringParameters, ALBResult } from 'aws-lambda';
import { getEnvironment, getFeatureCacheDurationHours, getHeaders } from '../environment';
import { log } from '../logger';
import { Feature, FeatureCollection, Geometry, GeoJsonProperties } from 'geojson';
import FairwayCardDBModel, { Harbor, PilotPlace, Quay } from '../db/fairwayCardDBModel';
import { gzip } from 'zlib';
import { AlueAPIModel, fetchVATUByFairwayClass, NavigointiLinjaAPIModel, RajoitusAlueAPIModel } from '../graphql/query/vatu';
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Readable } from 'stream';

const s3Client = new S3Client({ region: 'eu-west-1' });

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

function addQuay(harbor: Harbor, quay: Quay, features: Feature<Geometry, GeoJsonProperties>[]) {
  if (quay.geometry) {
    features.push({
      type: 'Feature',
      geometry: quay.geometry as Geometry,
      properties: {
        type: 'harbor',
        quay: quay.name,
        extraInfo: quay.extraInfo,
        length: quay.length,
        draft: quay.sections?.map((s) => s.draft),
        email: harbor.email,
        phoneNumber: harbor.phoneNumber,
        fax: harbor.fax,
        internet: harbor.internet,
      },
    });
  } else {
    for (const section of quay.sections || []) {
      if (section.geometry) {
        features.push({
          type: 'Feature',
          geometry: section.geometry as Geometry,
          properties: {
            type: 'harbor',
            quay: quay.name,
            extraInfo: quay.extraInfo,
            length: quay.length,
            name: section.name,
            draft: [section.draft],
            email: harbor.email,
            phoneNumber: harbor.phoneNumber,
            fax: harbor.fax,
            internet: harbor.internet,
          },
        });
      }
    }
  }
}

async function addHarborFeatures(features: Feature<Geometry, GeoJsonProperties>[]) {
  const cards = await FairwayCardDBModel.getAll();
  for (const card of cards) {
    for (const harbor of card.harbors || []) {
      for (const quay of harbor.quays || []) {
        addQuay(harbor, quay, features);
      }
    }
  }
}

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
  // 1 = Navigointialue, 3 = Ohitus- ja kohtaamisalue, 4 = Satama-allas, 5 = Kääntöallas
  // 2 = Ankkurointialue, 15 = Kohtaamis- ja ohittamiskieltoalue
  for (const area of areas.filter((a) =>
    navigationArea
      ? a.tyyppiKoodi === 1 || a.tyyppiKoodi === 3 || a.tyyppiKoodi === 4 || a.tyyppiKoodi === 5
      : a.tyyppiKoodi === 2 || a.tyyppiKoodi === 15
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
  for (const area of areas.filter(
    (a) => a.rajoitustyyppi === 'Nopeusrajoitus' || (a.rajoitustyypit?.filter((b) => b.rajoitustyyppi === 'Nopeusrajoitus')?.length || 0) > 0
  )) {
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

function getCacheBucketName() {
  return `featurecache-${getEnvironment()}`;
}

function getKey(queryString: ALBEventQueryStringParameters | undefined) {
  if (queryString) {
    const key = (queryString.type || '') + (queryString.vaylaluokka ? queryString.vaylaluokka : '');
    if (key !== '') {
      return key;
    }
  }
  return 'noquerystring';
}

async function cacheResponse(key: string, response: string, cacheDurationHours: number) {
  const expires = new Date();
  expires.setTime(expires.getTime() + cacheDurationHours * 60 * 60 * 1000);
  const command = new PutObjectCommand({
    Key: key,
    Bucket: getCacheBucketName(),
    Expires: expires,
    Body: response,
  });
  await s3Client.send(command);
}

async function getFromCache(key: string): Promise<string | undefined> {
  try {
    const data = await s3Client.send(
      new GetObjectCommand({
        Key: key,
        Bucket: getCacheBucketName(),
      })
    );
    if (data.Body && data.Expires && data.Expires.getTime() > Date.now()) {
      log.debug(`returning ${key} from cache`);
      const streamToString = (stream: Readable): Promise<string> =>
        new Promise((resolve, reject) => {
          const chunks: Uint8Array[] = [];
          stream.on('data', (chunk: Uint8Array) => chunks.push(chunk));
          stream.on('error', reject);
          stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
        });
      return await streamToString(data.Body as Readable);
    }
  } catch (e) {
    // not found
    return undefined;
  }
  return undefined;
}

export const handler = async (event: ALBEvent): Promise<ALBResult> => {
  log.info({ event }, `featureloader()`);
  const key = getKey(event.queryStringParameters);
  let base64Response: string;
  const cacheDurationHours = await getFeatureCacheDurationHours();
  log.debug('cacheDurationHours: %d', cacheDurationHours);
  const response = cacheDurationHours > 0 ? await getFromCache(key) : undefined;
  if (response) {
    base64Response = response;
  } else {
    const features: Feature<Geometry, GeoJsonProperties>[] = [];
    const types = event.queryStringParameters?.type?.split(',') || [];
    if (types.includes('pilot')) {
      await addPilotFeatures(features);
    }
    if (types.includes('harbor')) {
      await addHarborFeatures(features);
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
    let start = Date.now();
    const body = JSON.stringify(collection);
    log.debug('stringify duration: %d ms', Date.now() - start);
    start = Date.now();
    const gzippedResponse = await gzipString(body);
    log.debug('gzip duration: %d ms', Date.now() - start);
    start = Date.now();
    base64Response = gzippedResponse.toString('base64');
    log.debug('base64 duration: %d ms', Date.now() - start);
    if (cacheDurationHours > 0) {
      await cacheResponse(key, base64Response, cacheDurationHours);
    }
  }
  return {
    statusCode: 200,
    body: base64Response,
    isBase64Encoded: true,
    headers: { ...getHeaders(), 'Content-Type': 'application/geo+json' },
  };
};
