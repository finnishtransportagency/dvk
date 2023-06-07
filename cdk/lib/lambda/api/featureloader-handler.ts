import { ALBEvent, ALBEventMultiValueQueryStringParameters, ALBResult } from 'aws-lambda';
import { getFeatureCacheDurationHours, getHeaders } from '../environment';
import { log } from '../logger';
import { Feature, FeatureCollection, Geometry, GeoJsonProperties } from 'geojson';
import FairwayCardDBModel, { FairwayCardIdName } from '../db/fairwayCardDBModel';
import { gzip } from 'zlib';
import {
  AlueAPIModel,
  fetchVATUByApi,
  fetchVATUByFairwayClass,
  KaantoympyraAPIModel,
  NavigointiLinjaAPIModel,
  RajoitusAlueAPIModel,
  TaululinjaAPIModel,
  TurvalaiteAPIModel,
  TurvalaiteVikatiedotAPIModel,
} from '../graphql/query/vatu';
import HarborDBModel from '../db/harborDBModel';
import { fetchMarineWarnings, parseDateTimes } from './pooki';
import { fetchBuoys, fetchMareoGraphs, fetchWeatherObservations } from './weather';
import { GeometryPoint, Text } from '../../../graphql/generated';
import { fetchPilotPoints, fetchVTSLines, fetchVTSPoints } from './traficom';
import { cacheResponse, getFromCache } from '../graphql/cache';

function getNumberValue(value: number | undefined): number | undefined {
  return value && value > 0 ? value : undefined;
}

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
  const harbors = await HarborDBModel.getAllPublic();
  const harborMap = new Map<string, HarborDBModel & { fairwayCards: FairwayCardIdName[] }>();
  for (const harbor of harbors) {
    harborMap.set(harbor.id, { ...harbor, fairwayCards: [] });
  }
  const cards = await FairwayCardDBModel.getAllPublic();
  for (const card of cards) {
    for (const h of card.harbors || []) {
      harborMap.get(h.id)?.fairwayCards.push({ id: card.id, name: card.name });
    }
  }
  const ids: string[] = [];
  for (const harbor of harborMap.values()) {
    const cardHarbor = harborMap.get(harbor.id);
    if (harbor?.geometry?.coordinates?.length === 2 && cardHarbor && cardHarbor.fairwayCards.length > 0) {
      const id = harbor.geometry.coordinates.join(';');
      // MW/N2000 Harbors should have same location
      if (!ids.includes(id)) {
        ids.push(id);
        features.push({
          type: 'Feature',
          id,
          geometry: harbor.geometry as Geometry,
          properties: {
            featureType: 'harbor',
            id,
            harborId: harbor.id,
            name: harbor.name ?? harbor.company,
            email: harbor.email,
            phoneNumber: harbor.phoneNumber,
            fax: harbor.fax,
            internet: harbor.internet,
            quays: harbor.quays?.length || 0,
            fairwayCards: harbor.fairwayCards,
            extraInfo: harbor.extraInfo,
          },
        });
      } else {
        const harborFeature = features.find((feature) => feature.id === id);
        harborFeature?.properties?.fairwayCards.push(...harbor.fairwayCards);
      }
    }
  }
}

type PilotPlace = {
  id: number;
  name: Text;
  geometry: GeometryPoint;
  fairwayCards: FairwayCardIdName[];
};

async function addPilotFeatures(features: Feature<Geometry, GeoJsonProperties>[]) {
  const placeMap = new Map<number, PilotPlace>();
  const cards = await FairwayCardDBModel.getAllPublic();
  const pilots = await fetchPilotPoints();
  for (const pilot of pilots) {
    placeMap.set(pilot.id, { ...pilot, fairwayCards: [] });
  }
  for (const card of cards) {
    const pilot = card.trafficService?.pilot;
    if (pilot && pilot.places) {
      for (const place of pilot.places) {
        placeMap.get(place.id)?.fairwayCards.push({ id: card.id, name: card.name });
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

async function getCardMap() {
  const cardMap = new Map<number, FairwayCardIdName[]>();
  const cards = await FairwayCardDBModel.getAllPublic();
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
    (a) => a.tyyppiKoodi === 1 || a.tyyppiKoodi === 3 || a.tyyppiKoodi === 4 || a.tyyppiKoodi === 5 || a.tyyppiKoodi === 11 || a.tyyppiKoodi === 2
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

// 1 = Navigointialue, 3 = Ohitus- ja kohtaamisalue, 4 = Satama-allas, 5 = Kääntöallas, 11 = Varmistettu lisäalue
// 2 = Ankkurointialue, 15 = Kohtaamis- ja ohittamiskieltoalue
const navigationAreaFilter = (a: AlueAPIModel) =>
  a.tyyppiKoodi === 1 || a.tyyppiKoodi === 3 || a.tyyppiKoodi === 4 || a.tyyppiKoodi === 5 || a.tyyppiKoodi === 11;
const specialAreaFilter = (a: AlueAPIModel) => a.tyyppiKoodi === 2 || a.tyyppiKoodi === 15;
const anchoringAreaFilter = (a: AlueAPIModel) => a.tyyppiKoodi === 2;
const meetRestrictionAreaFilter = (a: AlueAPIModel) => a.tyyppiKoodi === 15;
function getAreaFilter(type: string) {
  if (type === 'area') {
    return navigationAreaFilter;
  } else if (type === 'specialarea2') {
    return anchoringAreaFilter;
  } else if (type === 'specialarea15') {
    return meetRestrictionAreaFilter;
  } else if (type === 'specialarea') {
    return specialAreaFilter;
  }
  return;
}

async function addAreaFeatures(
  features: Feature<Geometry, GeoJsonProperties>[],
  event: ALBEvent,
  featureType: string,
  areaFilter: (a: AlueAPIModel) => boolean
) {
  const cardMap = await getCardMap();
  const areas = await fetchVATUByFairwayClass<AlueAPIModel>('vaylaalueet', event);
  log.debug('areas: %d', areas.length);

  for (const area of areas.filter(areaFilter)) {
    features.push({
      type: 'Feature',
      id: area.id,
      geometry: area.geometria as Geometry,
      properties: {
        id: area.id,
        featureType: featureType,
        name: area.nimi,
        depth: getNumberValue(area.harausSyvyys),
        typeCode: area.tyyppiKoodi,
        type: area.tyyppi,
        draft: getNumberValue(area.mitoitusSyvays),
        referenceLevel: area.vertaustaso,
        n2000draft: getNumberValue(area.n2000MitoitusSyvays),
        n2000depth: getNumberValue(area.n2000HarausSyvyys),
        n2000ReferenceLevel: area.n2000Vertaustaso,
        extra: area.lisatieto?.trim(),
        fairways: area.vayla?.map((v) => {
          return {
            fairwayId: v.jnro,
            name: {
              fi: v.nimiFI,
              sv: v.nimiSV || v.nimiSE,
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
        depth: getNumberValue(line.harausSyvyys),
        draft: getNumberValue(line.mitoitusSyvays),
        length: getNumberValue(line.pituus),
        n2000depth: getNumberValue(line.n2000HarausSyvyys),
        n2000draft: getNumberValue(line.n2000MitoitusSyvays),
        referenceLevel: line.vertaustaso,
        n2000ReferenceLevel: line.n2000Vertaustaso,
        extra: line.lisatieto?.trim(),
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
        navigation: { fi: equipment.navigointilajiFI, sv: equipment.navigointilajiSV },
        navigationCode: equipment.navigointilajiKoodi,
        name: { fi: equipment.nimiFI, sv: equipment.nimiSV },
        symbol: equipment.symboli,
        typeCode: equipment.turvalaitetyyppiKoodi,
        typeName: { fi: equipment.turvalaitetyyppiFI, sv: equipment.turvalaitetyyppiSV },
        lightning: equipment.valaistu === 'K',
        aisType: equipment.AISTyyppi,
        remoteControl: equipment.kaukohallinta,
        fairways: equipment.vayla?.map((v) => {
          return { fairwayId: v.jnro, primary: v.paavayla === 'P', fairwayCards: cardMap.get(v.jnro) };
        }),
        distances: equipment.reunaetaisyys?.map((v) => {
          return { areaId: v.vaylaalueID, distance: v.etaisyys };
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
  for (const feature of resp.features) {
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

async function addVTSPointsOrLines(features: Feature<Geometry, GeoJsonProperties>[], isPoint: boolean) {
  const resp = isPoint ? await fetchVTSPoints() : await fetchVTSLines();
  for (const feature of resp) {
    features.push({
      type: feature.type,
      id: feature.id,
      geometry: feature.geometry,
      properties: {
        featureType: feature.geometry.type === 'Point' ? 'vtspoint' : 'vtsline',
        identifier: feature.properties?.IDENTIFIER,
        name: feature.properties?.OBJNAM,
        information: feature.properties?.INFORM,
        // eslint-disable-next-line no-useless-escape
        channel: feature.properties?.COMCHA?.replace(/[\[\]]/g, ''),
      },
    });
  }
}

async function addMareoGraphs(features: Feature<Geometry, GeoJsonProperties>[]) {
  const resp = await fetchMareoGraphs();
  for (const mareograph of resp) {
    features.push({
      type: 'Feature',
      id: mareograph.id,
      geometry: mareograph.geometry,
      properties: {
        featureType: 'mareograph',
        calculated: mareograph.calculated,
        name: mareograph.name,
        waterLevel: mareograph.waterLevel,
        n2000WaterLevel: mareograph.n2000WaterLevel,
        dateTime: mareograph.dateTime,
      },
    });
  }
}

async function addWeatherObservations(features: Feature<Geometry, GeoJsonProperties>[]) {
  const resp = await fetchWeatherObservations();
  for (const observation of resp) {
    features.push({
      type: 'Feature',
      id: observation.id,
      geometry: observation.geometry,
      properties: {
        featureType: 'observation',
        name: observation.name,
        temperature: observation.temperature,
        windSpeedAvg: observation.windSpeedAvg,
        windSpeedMax: observation.windSpeedMax,
        windDirection: observation.windDirection,
        visibility: observation.visibility,
        dateTime: observation.dateTime,
      },
    });
  }
}

async function addBuoys(features: Feature<Geometry, GeoJsonProperties>[]) {
  const resp = await fetchBuoys();
  for (const buoy of resp) {
    features.push({
      type: 'Feature',
      id: buoy.id,
      geometry: buoy.geometry,
      properties: {
        featureType: 'buoy',
        name: buoy.name,
        dateTime: buoy.dateTime,
        temperature: buoy.temperature,
        waveDirection: buoy.waveDirection,
        waveHeight: buoy.waveHeight,
      },
    });
  }
}

async function addTurningCircleFeatures(features: Feature<Geometry, GeoJsonProperties>[]) {
  const circles = await fetchVATUByApi<KaantoympyraAPIModel>('kaantoympyrat');
  log.debug('circles: %d', circles.length);
  for (const circle of circles) {
    features.push({
      type: 'Feature',
      id: circle.kaantoympyraID,
      geometry: circle.geometria as Geometry,
      properties: {
        featureType: 'circle',
        diameter: circle.halkaisija,
      },
    });
  }
}

function getKey(queryString: ALBEventMultiValueQueryStringParameters | undefined) {
  if (queryString) {
    const key = (queryString.type?.join(',') || '') + (queryString.vaylaluokka ? queryString.vaylaluokka.join(',') : '');
    if (key !== '') {
      return key;
    }
  }
  return 'noquerystring';
}

const noCache = ['safetyequipmentfault', 'marinewarning', 'mareograph', 'observation', 'buoy', 'harbor'];

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
  } else if (type === 'area' || type === 'specialarea' || type === 'specialarea2' || type === 'specialarea15') {
    const areaFilter = getAreaFilter(type);
    if (!areaFilter) return false;
    await addAreaFeatures(features, event, type, areaFilter);
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
  } else if (type === 'vtspoint') {
    await addVTSPointsOrLines(features, true);
  } else if (type === 'vtsline') {
    await addVTSPointsOrLines(features, false);
  } else if (type === 'depth') {
    await addDepthFeatures(features, event);
  } else if (type === 'boardline') {
    await addBoardLineFeatures(features, event);
  } else if (type === 'mareograph') {
    await addMareoGraphs(features);
  } else if (type === 'observation') {
    await addWeatherObservations(features);
  } else if (type === 'buoy') {
    await addBuoys(features);
  } else if (type === 'circle') {
    await addTurningCircleFeatures(features);
  } else {
    return false;
  }
  return true;
}

export const handler = async (event: ALBEvent): Promise<ALBResult> => {
  log.info({ event }, `featureloader()`);
  const key = getKey(event.multiValueQueryStringParameters);
  const type = event.multiValueQueryStringParameters?.type?.join(',') || '';
  let base64Response: string | undefined;
  let statusCode = 200;
  const cacheEnabled = await isCacheEnabled(type);
  const response = await getFromCache(key);
  if (cacheEnabled && !response.expired && response.data) {
    base64Response = response.data;
  } else {
    try {
      const features: Feature<Geometry, GeoJsonProperties>[] = [];
      const validType = await addFeatures(type, features, event);
      const collection: FeatureCollection = {
        type: 'FeatureCollection',
        features,
      };
      if (!validType) {
        log.info('Invalid type: %s', type);
        base64Response = undefined;
        statusCode = 400;
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
        await cacheResponse(key, base64Response);
      }
    } catch (e) {
      log.error('Getting features failed: %s', e);
      if (response.data) {
        log.warn('Returning possibly expired response from s3 cache');
        base64Response = response.data;
      } else {
        base64Response = undefined;
        statusCode = 500;
      }
    }
  }
  return {
    statusCode,
    body: base64Response,
    isBase64Encoded: true,
    multiValueHeaders: {
      ...getHeaders(),
      'Content-Type': ['application/geo+json'],
    },
  };
};
