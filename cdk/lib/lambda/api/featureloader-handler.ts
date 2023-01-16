import { ALBEvent, ALBEventQueryStringParameters, ALBResult } from 'aws-lambda';
import { getEnvironment, getFeatureCacheDurationHours, getHeaders } from '../environment';
import { log } from '../logger';
import { Feature, FeatureCollection, Geometry, GeoJsonProperties } from 'geojson';
import FairwayCardDBModel, { FairwayCardIdName, PilotPlace } from '../db/fairwayCardDBModel';
import { gzip } from 'zlib';
import {
  AlueAPIModel,
  fetchVATUByApi,
  fetchVATUByFairwayClass,
  NavigointiLinjaAPIModel,
  RajoitusAlueAPIModel,
  TaululinjaAPIModel,
  TurvalaiteAPIModel,
  TurvalaiteVikatiedotAPIModel,
} from '../graphql/query/vatu';
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import HarborDBModel from '../db/harborDBModel';
import { fetchMarineWarnings, parseDateTimes } from './pooki';

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
  try {
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
  } catch (e) {
    log.error('Getting all harbors failed: %s', e);
  }
}

async function addPilotFeatures(features: Feature<Geometry, GeoJsonProperties>[]) {
  try {
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
  } catch (e) {
    log.error('Getting all pilot places failed: %s', e);
  }
}

async function getCardMap() {
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
  return cardMap;
}

async function addDepthFeatures(features: Feature<Geometry, GeoJsonProperties>[], event: ALBEvent) {
  const areas = await fetchVATUByFairwayClass<AlueAPIModel>('vaylaalueet', event);
  log.debug('areas: %d', areas.length);
  for (const area of areas.filter(
    (a) =>
      a.tyyppiKoodi === 1 ||
      a.tyyppiKoodi === 3 ||
      a.tyyppiKoodi === 4 ||
      a.tyyppiKoodi === 5 ||
      a.tyyppiKoodi === 11 ||
      a.tyyppiKoodi === 2 ||
      a.tyyppiKoodi === 15
  )) {
    features.push({
      type: 'Feature',
      id: area.id,
      geometry: area.geometria as Geometry,
      properties: {
        id: area.id,
        featureType: 'depth',
        areaType: area.tyyppiKoodi,
        depth: area.harausSyvyys && area.harausSyvyys > 0 ? area.harausSyvyys : undefined,
        draft: area.mitoitusSyvays && area.mitoitusSyvays > 0 ? area.mitoitusSyvays : undefined,
        referenceLevel: area.vertaustaso,
        n2000draft: area.n2000MitoitusSyvays && area.n2000MitoitusSyvays > 0 ? area.n2000MitoitusSyvays : undefined,
        n2000depth: area.n2000HarausSyvyys && area.n2000HarausSyvyys > 0 ? area.n2000HarausSyvyys : undefined,
        n2000ReferenceLevel: area.n2000Vertaustaso,
      },
    });
  }
}

async function addAreaFeatures(features: Feature<Geometry, GeoJsonProperties>[], navigationArea: boolean, event: ALBEvent) {
  const cardMap = await getCardMap();
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
        depth: area.harausSyvyys && area.harausSyvyys > 0 ? area.harausSyvyys : undefined,
        typeCode: area.tyyppiKoodi,
        type: area.tyyppi,
        draft: area.mitoitusSyvays && area.mitoitusSyvays > 0 ? area.mitoitusSyvays : undefined,
        referenceLevel: area.vertaustaso,
        n2000draft: area.n2000MitoitusSyvays && area.n2000MitoitusSyvays > 0 ? area.n2000MitoitusSyvays : undefined,
        n2000depth: area.n2000HarausSyvyys && area.n2000HarausSyvyys > 0 ? area.n2000HarausSyvyys : undefined,
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

async function addBoardLineFeatures(features: Feature<Geometry, GeoJsonProperties>[], event: ALBEvent) {
  const lines = await fetchVATUByFairwayClass<TaululinjaAPIModel>('taululinjat', event);
  const cardMap = await getCardMap();
  log.debug('board lines: %d', lines.length);
  for (const line of lines) {
    features.push({
      type: 'Feature',
      id: line.taululinjaId,
      geometry: line.geometria as Geometry,
      properties: {
        id: line.taululinjaId,
        featureType: 'boardline',
        direction: line.suunta,
        fairways: line.vayla?.map((v) => {
          return {
            fairwayId: v.jnro,
            name: {
              fi: v.nimiFI,
              sv: v.nimiSV,
            },
            fairwayCards: cardMap.get(v.jnro),
          };
        }),
      },
    });
  }
}

async function addLineFeatures(features: Feature<Geometry, GeoJsonProperties>[], event: ALBEvent) {
  const lines = await fetchVATUByFairwayClass<NavigointiLinjaAPIModel>('navigointilinjat', event);
  const cardMap = await getCardMap();
  log.debug('lines: %d', lines.length);
  for (const line of lines) {
    features.push({
      type: 'Feature',
      id: line.id,
      geometry: line.geometria as Geometry,
      properties: {
        id: line.id,
        featureType: 'line',
        depth: line.harausSyvyys && line.harausSyvyys > 0 ? line.harausSyvyys : undefined,
        draft: line.mitoitusSyvays && line.mitoitusSyvays > 0 ? line.mitoitusSyvays : undefined,
        length: line.pituus && line.pituus > 0 ? line.pituus : undefined,
        n2000depth: line.n2000HarausSyvyys && line.n2000HarausSyvyys > 0 ? line.n2000HarausSyvyys : undefined,
        n2000draft: line.n2000MitoitusSyvays && line.n2000MitoitusSyvays > 0 ? line.n2000MitoitusSyvays : undefined,
        direction: line.tosisuunta,
        extra: line.lisatieto,
        fairways: line.vayla?.map((v) => {
          return {
            fairwayId: v.jnro,
            name: {
              fi: v.nimiFI,
              sv: v.nimiSV,
            },
            fairwayCards: cardMap.get(v.jnro),
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
  const cardMap = await getCardMap();
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
          return { fairwayId: v.jnro, primary: v.paavayla === 'P', fairwayCards: cardMap.get(v.jnro) };
        }),
      },
    });
  }
}

async function addSafetyEquipmentFaultFeatures(features: Feature<Geometry, GeoJsonProperties>[]) {
  const faults = await fetchVATUByApi<TurvalaiteVikatiedotAPIModel>('vikatiedot');
  log.debug('faults: %d', faults.length);
  for (const fault of faults) {
    features.push({
      type: 'Feature',
      id: fault.vikaId,
      geometry: fault.geometria as Geometry,
      properties: {
        equipmentId: fault.turvalaiteNumero,
        featureType: 'safetyequipmentfault',
        name: { fi: fault.turvalaiteNimiFI, sv: fault.turvalaiteNimiSV },
        type: { fi: fault.vikatyyppiFI, sv: fault.vikatyyppiSV },
        typeCode: fault.vikatyyppiKoodi,
        recordTime: Date.parse(fault.kirjausAika),
      },
    });
  }
}

async function addMarineWarnings(features: Feature<Geometry, GeoJsonProperties>[]) {
  const resp = await fetchMarineWarnings();
  for (const feature of resp.data?.features || []) {
    const dates = parseDateTimes(feature);
    features.push({
      type: feature.type,
      id: feature.properties?.ID,
      geometry: feature.geometry,
      properties: {
        featureType: 'marinewarning',
        number: feature.properties?.NUMERO,
        area: { fi: feature.properties?.ALUEET_FI, sv: feature.properties?.ALUEET_SV, en: feature.properties?.ALUEET_EN },
        type: { fi: feature.properties?.TYYPPI_FI, sv: feature.properties?.TYYPPI_SV, en: feature.properties?.TYYPPI_EN },
        location: { fi: feature.properties?.SIJAINTI_FI, sv: feature.properties?.SIJAINTI_SV, en: feature.properties?.SIJAINTI_EN },
        description: { fi: feature.properties?.SISALTO_FI, sv: feature.properties?.SISALTO_SV, en: feature.properties?.SISALTO_EN },
        startDateTime: dates.startDateTime,
        endDateTime: dates.endDateTime,
        dateTime: dates.dateTime,
        notifier: feature.properties?.TIEDOKSIANTAJA,
        equipmentText: feature.properties?.TURVALAITE_TXT,
        equipmentId: Number(feature.properties?.TURVALAITE_TXT?.match(/\d.*/)[0]),
        lineText: feature.properties?.NAVIGOINTILINJA_TXT,
        lineId: Number(feature.properties?.NAVIGOINTILINJA_TXT?.match(/\d.*/)[0]),
        areaText: feature.properties?.VAYLAALUE_TXT,
        areaId: Number(feature.properties?.VAYLAALUE_TXT?.match(/\d.*/)[0]),
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

async function cacheResponse(key: string, response: string) {
  const cacheDurationHours = await getFeatureCacheDurationHours();
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

type CacheResponse = {
  expired: boolean;
  data?: string;
};

async function getFromCache(key: string): Promise<CacheResponse> {
  try {
    const data = await s3Client.send(
      new GetObjectCommand({
        Key: key,
        Bucket: getCacheBucketName(),
      })
    );
    if (data.Body) {
      log.debug(`returning ${key} from cache`);
      const streamToString = (stream: Readable): Promise<string> =>
        new Promise((resolve, reject) => {
          const chunks: Uint8Array[] = [];
          stream.on('data', (chunk: Uint8Array) => chunks.push(chunk));
          stream.on('error', reject);
          stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
        });
      return { expired: data.Expires !== undefined && data.Expires.getTime() < Date.now(), data: await streamToString(data.Body as Readable) };
    }
  } catch (e) {
    // errors ignored also not found
  }
  return { expired: true };
}

const noCache = ['safetyequipmentfault', 'marinewarning'];

async function isCacheEnabled(type: string): Promise<boolean> {
  const cacheDurationHours = await getFeatureCacheDurationHours();
  log.debug('cacheDurationHours: %d', cacheDurationHours);
  const cacheEnabled = cacheDurationHours > 0 && !noCache.includes(type);
  log.debug('cacheEnabled: %s', cacheEnabled);
  return cacheEnabled;
}

async function addFeatures(type: string, features: Feature<Geometry, GeoJsonProperties>[], event: ALBEvent): Promise<boolean> {
  if (type === 'pilot') {
    await addPilotFeatures(features);
  } else if (type === 'harbor') {
    await addHarborFeatures(features);
  } else if (type === 'area') {
    await addAreaFeatures(features, true, event);
  } else if (type === 'specialarea') {
    await addAreaFeatures(features, false, event);
  } else if (type === 'restrictionarea') {
    await addRestrictionAreaFeatures(features, event);
  } else if (type === 'line') {
    await addLineFeatures(features, event);
  } else if (type === 'safetyequipment') {
    await addSafetyEquipmentFeatures(features, event);
  } else if (type === 'safetyequipmentfault') {
    await addSafetyEquipmentFaultFeatures(features);
  } else if (type === 'marinewarning') {
    await addMarineWarnings(features);
  } else if (type === 'depth') {
    await addDepthFeatures(features, event);
  } else if (type === 'boardline') {
    await addBoardLineFeatures(features, event);
  } else {
    return false;
  }
  return true;
}

export const handler = async (event: ALBEvent): Promise<ALBResult> => {
  log.info({ event }, `featureloader()`);
  const key = getKey(event.queryStringParameters);
  const type = event.queryStringParameters?.type || '';
  let base64Response: string | undefined;
  let statusCode = 200;
  const cacheEnabled = await isCacheEnabled(type);
  const response = cacheEnabled ? await getFromCache(key) : { expired: true };
  if (!response.expired && response.data) {
    base64Response = response.data;
  } else {
    const features: Feature<Geometry, GeoJsonProperties>[] = [];
    const validType = await addFeatures(type, features, event);
    const collection: FeatureCollection = {
      type: 'FeatureCollection',
      features,
    };
    if (features.length === 0 && response.data) {
      log.warn('Getting features failed, returning response from s3 cache');
      base64Response = response.data;
    } else if (features.length === 0) {
      base64Response = undefined;
      statusCode = validType ? 500 : 400;
      log.error('Getting features failed and no cached response, statusCode: %d', statusCode);
    } else {
      let start = Date.now();
      const body = JSON.stringify(collection);
      log.debug('stringify duration: %d ms', Date.now() - start);
      start = Date.now();
      const gzippedResponse = await gzipString(body);
      log.debug('gzip duration: %d ms', Date.now() - start);
      start = Date.now();
      base64Response = gzippedResponse.toString('base64');
      log.debug('base64 duration: %d ms', Date.now() - start);
      if (cacheEnabled && collection.features.length > 0) {
        await cacheResponse(key, base64Response);
      }
    }
  }
  return {
    statusCode,
    body: base64Response,
    isBase64Encoded: true,
    headers: { ...getHeaders(), 'Content-Type': 'application/geo+json' },
  };
};
