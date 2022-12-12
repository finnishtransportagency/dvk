import { ALBEvent, ALBEventQueryStringParameters, ALBResult } from 'aws-lambda';
import { getEnvironment, getFeatureCacheDurationHours, getHeaders } from '../environment';
import { log } from '../logger';
import { Feature, FeatureCollection, Geometry, GeoJsonProperties } from 'geojson';
import FairwayCardDBModel, { FairwayCardIdName, PilotPlace } from '../db/fairwayCardDBModel';
import { gzip } from 'zlib';
import { AlueAPIModel, fetchVATUByFairwayClass, NavigointiLinjaAPIModel, RajoitusAlueAPIModel, TurvalaiteAPIModel } from '../graphql/query/vatu';
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import HarborDBModel from '../db/harborDBModel';

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

async function addHarborFeatures(features: Feature<Geometry, GeoJsonProperties>[]) {
  const harbors = await HarborDBModel.getAll();
  for (const harbor of harbors || []) {
    if (harbor?.geometry?.coordinates?.length === 2) {
      features.push({
        type: 'Feature',
        geometry: harbor.geometry as Geometry,
        properties: {
          featureType: 'harbor',
          id: harbor.id,
          name: harbor.name ?? harbor.company,
          email: harbor.email,
          phoneNumber: harbor.phoneNumber,
          fax: harbor.fax,
          internet: harbor.internet,
        },
      });
    }
  }
}

async function addPilotFeatures(features: Feature<Geometry, GeoJsonProperties>[]) {
  const placeMap = new Map<number, PilotPlace>();
  const cards = await FairwayCardDBModel.getAll();
  for (const card of cards) {
    const pilot = card.trafficService?.pilot;
    if (pilot && pilot.places) {
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
      id: place.id,
      properties: {
        featureType: 'pilot',
        name: place.name,
        fairwayCards: place.fairwayCards,
      },
    });
  }
}

async function addAreaFeatures(features: Feature<Geometry, GeoJsonProperties>[], navigationArea: boolean, event: ALBEvent) {
  const cardMap = new Map<number, FairwayCardIdName[]>();
  const cards = await FairwayCardDBModel.getAll();
  for (const card of cards) {
    for (const id of card.fairways.map((f) => f.id)) {
      if (!cardMap.has(id)) {
        cardMap.set(id, []);
      }
      cardMap.get(id)?.push({ id: card.id, name: card.name });
    }
  }
  const areas = await fetchVATUByFairwayClass<AlueAPIModel>('vaylaalueet', event);
  log.debug('areas: %d', areas.length);
  // 1 = Navigointialue, 3 = Ohitus- ja kohtaamisalue, 4 = Satama-allas, 5 = Kääntöallas, 11 = Varmistettu lisäalue
  // 2 = Ankkurointialue, 15 = Kohtaamis- ja ohittamiskieltoalue
  for (const area of areas.filter((a) =>
    navigationArea
      ? a.tyyppiKoodi === 1 || a.tyyppiKoodi === 3 || a.tyyppiKoodi === 4 || a.tyyppiKoodi === 5 || a.tyyppiKoodi === 11
      : a.tyyppiKoodi === 2 || a.tyyppiKoodi === 15
  )) {
    features.push({
      type: 'Feature',
      id: area.id,
      geometry: area.geometria as Geometry,
      properties: {
        id: area.id,
        featureType: navigationArea ? 'area' : 'specialarea',
        name: area.nimi,
        depth: area.harausSyvyys,
        typeCode: area.tyyppiKoodi,
        type: area.tyyppi,
        draft: area.mitoitusSyvays,
        referenceLevel: area.vertaustaso,
        n2000draft: area.n2000MitoitusSyvays,
        n2000depth: area.n2000HarausSyvyys,
        n2000ReferenceLevel: area.n2000Vertaustaso,
        extra: area.lisatieto,
        fairways: area.vayla?.map((v) => {
          return {
            fairwayId: v.jnro,
            name: {
              fi: v.nimiFI,
              sv: v.nimiSV,
            },
            fairwayCards: cardMap.get(v.jnro),
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
      id: area.id,
      geometry: area.geometria as Geometry,
      properties: {
        id: area.id,
        featureType: 'restrictionarea',
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
      id: line.id,
      geometry: line.geometria as Geometry,
      properties: {
        id: line.id,
        featureType: 'line',
        depth: line.harausSyvyys,
        draft: line.mitoitusSyvays,
        n2000depth: line.n2000HarausSyvyys,
        n2000draft: line.n2000MitoitusSyvays,
        type: line.tyyppi,
        typeCode: line.tyyppiKoodi,
        fairways: line.vayla?.map((v) => {
          return {
            fairwayId: v.jnro,
            name: {
              fi: v.nimiFI,
              sv: v.nimiSV,
            },
            status: v.status,
            line: v.linjaus,
          };
        }),
      },
    });
  }
}

async function addSafetyEquipmentFeatures(features: Feature<Geometry, GeoJsonProperties>[], event: ALBEvent) {
  const equipments = await fetchVATUByFairwayClass<TurvalaiteAPIModel>('turvalaitteet', event);
  log.debug('equipments: %d', equipments.length);
  for (const equipment of equipments) {
    features.push({
      type: 'Feature',
      id: equipment.turvalaitenumero,
      geometry: equipment.geometria as Geometry,
      properties: {
        id: equipment.turvalaitenumero,
        featureType: 'safetyequipment',
        subType: equipment.alityyppi,
        navigation: { fi: equipment.navigointilajiFI, sv: equipment.navigointilajiSV },
        navigationCode: equipment.navigointilajiKoodi,
        name: { fi: equipment.nimiFI, sv: equipment.nimiSV },
        symbol: equipment.symboli,
        typeCode: equipment.turvalaitetyyppiKoodi,
        typeName: { fi: equipment.turvalaitetyyppiFI, sv: equipment.turvalaitetyyppiSV },
        lightning: equipment.valaistu === 'K',
        fairways: equipment.vayla?.map((v) => {
          return { fairwayId: v.jnro, primary: v.paavayla === 'P' };
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
    if (types.includes('safetyequipment')) {
      await addSafetyEquipmentFeatures(features, event);
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
    if (cacheDurationHours > 0 && collection.features.length > 0) {
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
