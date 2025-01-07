import { ALBEvent, ALBEventMultiValueQueryStringParameters, ALBResult } from 'aws-lambda';
import { getHeaders, getWeatherResponseHeaders } from '../environment';
import { log } from '../logger';
import { Feature, FeatureCollection, Geometry, GeoJsonProperties } from 'geojson';
import { fetchVATUByFairwayClass } from '../graphql/query/vatu';
import HarborDBModel from '../db/harborDBModel';
import { parseDateTimes } from './pooki';
import { fetchBuoys, fetchMareoGraphs, fetchWeatherObservations, fetchWeatherWaveForecast } from './weather';
import { fetchN2000MapAreas, fetchPilotPoints, fetchProhibitionAreas, fetchVTSLines, fetchVTSPoints } from './traficom';
import { fetchVATUByApi, fetchMarineWarnings } from './axios';
import { getNumberValue, invertDegrees, mapPilotFeatures, roundDecimals, toBase64Response } from '../util';
import {
  AlueFeature,
  AlueFeatureCollection,
  KaantoympyraFeature,
  KaantoympyraFeatureCollection,
  NavigointiLinjaFeature,
  NavigointiLinjaFeatureCollection,
  RajoitusAlueFeature,
  RajoitusAlueFeatureCollection,
  TaululinjaFeature,
  TaululinjaFeatureCollection,
  TurvalaiteFeature,
  TurvalaiteFeatureCollection,
  TurvalaiteVikatiedotFeature,
  TurvalaiteVikatiedotFeatureCollection,
} from './apiModels';
import { booleanWithin as turf_booleanWithin } from '@turf/boolean-within';
import { getFeatureCacheControlHeaders, isCloudFrontCacheKey } from '../../cache';
import { cacheResponse, getFromCache } from '../s3Cache';

interface FeaturesWithMaxFetchTime {
  featureArray: Feature<Geometry, GeoJsonProperties>[];
  fetchedDate?: string;
}

async function addHarborFeatures(features: FeaturesWithMaxFetchTime) {
  const harbors = await HarborDBModel.getAllPublic();
  const harborMap = new Map<string, HarborDBModel>();

  for (const harbor of harbors) {
    harborMap.set(harbor.id, { ...harbor });
  }

  const ids: string[] = [];
  for (const harbor of harborMap.values()) {
    const cardHarbor = harborMap.get(harbor.id);
    if (harbor?.geometry?.coordinates?.length === 2 && cardHarbor) {
      const id = harbor.geometry.coordinates.join(';');
      // MW/N2000 Harbors should have same location
      if (!ids.includes(id)) {
        ids.push(id);
        features.featureArray.push({
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
            quays: harbor.quays?.length ?? 0,
            extraInfo: harbor.extraInfo,
          },
        });
      }
    }
  }
}

async function addPilotFeatures(features: FeaturesWithMaxFetchTime) {
  const pilotCacheKey = 'pilotplaces';
  
  try {
    // pilot points are not saved to s3 like prohibition areas are, since pilot places are
    // saved in many other cases (fairwayCard-handler, fairwayCards-handler, saveFairwayCard-handler)
    log.info(`Fetching ${pilotCacheKey} from traficom api`)
    const data = await fetchPilotPoints();
    const pilotPlaces = mapPilotFeatures(data) as Feature[];
    features.featureArray.push(...pilotPlaces);
    log.debug('Prohibition areas: %d', pilotPlaces.length);
  } catch (e) {
    log.error(`Fetching ${pilotCacheKey} from traficom api unsuccesful, retrieving from cache...`);
    log.error(e);
    log.error('mitä');
    const response = await getFromCache(pilotCacheKey);
    if (response.data) {
      const data = JSON.parse(response.data);
      const pilotPlaces = mapPilotFeatures(data) as Feature[];
      features.featureArray.push(...pilotPlaces);
    }

    log.info(`Fetching ${pilotCacheKey} from cache succesful!`)
  }
}

async function addDepthFeatures(features: FeaturesWithMaxFetchTime, event: ALBEvent) {
  const areas = (await fetchVATUByFairwayClass<AlueFeature>('vaylaalueet', event)).data as AlueFeatureCollection;
  log.debug('areas: %d', areas.features.length);
  for (const area of areas.features.filter((a) => filterArea(a, [1, 2, 3, 4, 5, 11]))) {
    features.featureArray.push(mapAreaFeature(area));
  }
}

function filterArea(area: AlueFeature, types: number[]): boolean {
  return types.includes(area.properties.tyyppiKoodi as number);
}

function mapAreaFeature(area: AlueFeature): Feature {
  return {
    type: 'Feature',
    id: area.properties.id,
    geometry: area.geometry,
    properties: {
      id: area.properties.id,
      featureType: 'depth',
      areaType: area.properties.tyyppiKoodi,
      depth: area.properties.harausSyvyys && area.properties.harausSyvyys > 0 ? area.properties.harausSyvyys : undefined,
      draft: area.properties.mitoitusSyvays && area.properties.mitoitusSyvays > 0 ? area.properties.mitoitusSyvays : undefined,
      referenceLevel: area.properties.vertaustaso,
      n2000draft: area.properties.n2000MitoitusSyvays && area.properties.n2000MitoitusSyvays > 0 ? area.properties.n2000MitoitusSyvays : undefined,
      n2000depth: area.properties.n2000HarausSyvyys && area.properties.n2000HarausSyvyys > 0 ? area.properties.n2000HarausSyvyys : undefined,
      n2000ReferenceLevel: area.properties.n2000Vertaustaso ?? undefined,
    },
  };
}

// 1 = Navigointialue, 3 = Ohitus- ja kohtaamisalue, 4 = Satama-allas, 5 = Kääntöallas, 11 = Varmistettu lisäalue
// 2 = Ankkurointialue
const navigationAreaFilter = (area: AlueFeature) => {
  return filterArea(area, [1, 3, 4, 5, 11]);
};
const anchoringAreaFilter = (area: AlueFeature) => {
  return filterArea(area, [2]);
};

function getAreaFilter(type: 'area' | 'specialarea2') {
  if (type === 'area') {
    return navigationAreaFilter;
  } else {
    return anchoringAreaFilter;
  }
}

async function addAreaFeatures(features: FeaturesWithMaxFetchTime, event: ALBEvent, featureType: string, areaFilter: (a: AlueFeature) => boolean) {

  const [areaData, traficomN2000MapAreas] = await Promise.all([
    fetchVATUByFairwayClass<AlueFeature>('vaylaalueet', event),
    fetchN2000MapAreas()
  ]);
  const areas = areaData.data as AlueFeatureCollection;
  log.debug('areas: %d', areas.features.length);

  for (const area of areas.features.filter(areaFilter)) {
    features.featureArray.push({
      type: 'Feature',
      id: area.properties.id,
      geometry: area.geometry,
      properties: {
        id: area.properties.id,
        featureType: featureType,
        name: area.properties.nimi,
        depth: getNumberValue(area.properties.harausSyvyys),
        typeCode: area.properties.tyyppiKoodi,
        type: area.properties.tyyppi,
        draft: getNumberValue(area.properties.mitoitusSyvays),
        referenceLevel: area.properties.vertaustaso,
        isN2000: inOfficialN2000Area(area.geometry, traficomN2000MapAreas),
        n2000draft: getNumberValue(area.properties.n2000MitoitusSyvays),
        n2000depth: getNumberValue(area.properties.n2000HarausSyvyys),
        n2000ReferenceLevel: area.properties.n2000Vertaustaso ?? undefined,
        extra: area.properties.lisatieto?.trim(),
        fairways: area.properties.vayla?.map((v) => {
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

async function addProhibitionAreaFeatures(features: FeaturesWithMaxFetchTime) {
  const prohibitionCacheKey = 'prohibitionareas';

  try {
    log.info(`Fetching ${prohibitionCacheKey} from traficom api`)
    const areas = await fetchProhibitionAreas();
    if (areas) {
      log.info('Saving response to S3');
      await cacheResponse(prohibitionCacheKey, areas);
      log.info('Saving successful!');
      log.debug('Prohibition areas: %d', areas.length);
      features.featureArray.push(...areas);
    } else {
      throw new Error('Fetching error');
    }
  } catch (e) {
    log.error(`Fetching ${prohibitionCacheKey} from traficom api unsuccesful, retrieving from cache...`);
    log.error(e);

    const response = await getFromCache(prohibitionCacheKey);
    if (response.data) {
      const areas = JSON.parse(response.data) as Feature[];

      log.debug('prohibition areas: %d', areas.length);
      features.featureArray.push(...areas);

      log.info(`Fetching ${prohibitionCacheKey} from cache succesful!`)
    }
  }
}

async function addRestrictionAreaFeatures(features: FeaturesWithMaxFetchTime, event: ALBEvent) {
  const areas = (await fetchVATUByFairwayClass<RajoitusAlueFeature>('rajoitusalueet', event)).data as RajoitusAlueFeatureCollection;
  log.debug('areas: %d', areas.features.length);
  for (const area of areas.features.filter(
    (a) =>
      a.properties.rajoitustyyppi === 'Nopeusrajoitus' ||
      (a.properties.rajoitustyypit?.filter((b) => b.rajoitustyyppi === 'Nopeusrajoitus')?.length ?? 0) > 0
  )) {
    const feature: Feature<Geometry, GeoJsonProperties> = {
      type: 'Feature',
      id: area.properties.id,
      geometry: area.geometry,
      properties: {
        id: area.properties.id,
        featureType: 'restrictionarea',
        value: area.properties.suuruus,
        types:
          area.properties.rajoitustyypit?.map((t) => {
            return { code: t.koodi, text: t.rajoitustyyppi };
          }) ?? [],
        exception: area.properties.poikkeus,
        fairways: area.properties.vayla?.map((v) => {
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
    if (area.properties.rajoitustyyppi) {
      feature.properties?.types.push({ text: area.properties.rajoitustyyppi });
    }
    features.featureArray.push(feature);
  }
}

async function addBoardLineFeatures(features: FeaturesWithMaxFetchTime, event: ALBEvent) {
  const lines = (await fetchVATUByFairwayClass<TaululinjaFeature>('taululinjat', event)).data as TaululinjaFeatureCollection;
  log.debug('board lines: %d', lines.features.length);
  for (const line of lines.features) {
    features.featureArray.push({
      type: 'Feature',
      id: line.properties.taululinjaId,
      geometry: line.geometry,
      properties: {
        id: line.properties.taululinjaId,
        featureType: 'boardline',
        direction: line.properties.suunta,
        fairways: line.properties.vayla?.map((v) => {
          return {
            fairwayId: v.jnro,
            name: {
              fi: v.nimiFI,
              sv: v.nimiSV,
            },
          };
        }),
      },
    });
  }
}

async function addLineFeatures(features: FeaturesWithMaxFetchTime, event: ALBEvent) {
  const [lineData, traficomN2000MapAreas] = await Promise.all([
    fetchVATUByFairwayClass<NavigointiLinjaFeature>('navigointilinjat', event),
    fetchN2000MapAreas()
  ]);

  const lines = lineData.data as NavigointiLinjaFeatureCollection;

  log.debug('lines: %d', lines.features.length);
  for (const line of lines.features) {
    features.featureArray.push(mapLineFeature(line, traficomN2000MapAreas));
  }
}


function inOfficialN2000Area(geom: Geometry, traficomN2000MapAreas: Geometry | undefined): boolean | undefined {
  if (traficomN2000MapAreas !== undefined) {
    try {
      return turf_booleanWithin(geom, traficomN2000MapAreas);
    } catch (e) {
      log.debug(e);
      return undefined;
    }
  }
  return undefined;
}

function mapLineFeature(line: NavigointiLinjaFeature, traficomN2000MapAreas: Geometry | undefined): Feature {
  return {
    type: 'Feature',
    id: line.properties?.id,
    geometry: line.geometry,
    properties: {
      id: line.properties?.id,
      featureType: 'line',
      depth: getNumberValue(line.properties?.harausSyvyys),
      direction: roundDecimals(line.properties?.tosisuunta, 1) ?? undefined,
      oppositeDirection: roundDecimals(invertDegrees(line.properties?.tosisuunta), 1) ?? undefined,
      draft: getNumberValue(line.properties?.mitoitusSyvays),
      length: getNumberValue(line.properties?.pituus),
      isN2000: inOfficialN2000Area(line.geometry, traficomN2000MapAreas),
      n2000depth: getNumberValue(line.properties?.n2000HarausSyvyys),
      n2000draft: getNumberValue(line.properties?.n2000MitoitusSyvays),
      referenceLevel: line.properties?.vertaustaso,
      n2000ReferenceLevel: line.properties?.n2000Vertaustaso ?? undefined,
      extra: line.properties?.lisatieto?.trim(),
      fairways: line.properties?.vayla?.map((v) => {
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
  };
}

async function addSafetyEquipmentFeatures(features: FeaturesWithMaxFetchTime, event: ALBEvent) {
  const equipments = (await fetchVATUByFairwayClass<TurvalaiteFeature>('turvalaitteet', event)).data as TurvalaiteFeatureCollection;

  const equipmentFeatures = 'features' in equipments ? equipments.features : equipments;
  log.debug('lines: %d', equipmentFeatures.length);
  for (const equipment of equipmentFeatures) {
    features.featureArray.push(mapSafetyEquipmentFeature(equipment));
  }
}

function mapSafetyEquipmentFeature(equipment: TurvalaiteFeature): Feature {
  return {
    type: 'Feature',
    id: equipment.properties.turvalaitenumero,
    geometry: equipment.geometry,
    properties: {
      id: equipment.properties.turvalaitenumero,
      featureType: 'safetyequipment',
      navigation: { fi: equipment.properties.navigointilajiFI, sv: equipment.properties.navigointilajiSV },
      navigationCode: equipment.properties.navigointilajiKoodi,
      name: { fi: equipment.properties.nimiFI, sv: equipment.properties.nimiSV },
      symbol: equipment.properties.symboli,
      typeCode: equipment.properties.turvalaitetyyppiKoodi,
      typeName: { fi: equipment.properties.turvalaitetyyppiFI, sv: equipment.properties.turvalaitetyyppiSV },
      lightning: equipment.properties.valaistu === 'K',
      aisType: equipment.properties.AISTyyppi,
      remoteControl: equipment.properties.kaukohallinta,
      fairways: equipment.properties.vayla?.map((v) => {
        return { fairwayId: v.jnro, primary: v.paavayla === 'P' };
      }),
      distances: equipment.properties.reunaetaisyys?.map((v) => {
        return { areaId: v.vaylaalueID, distance: v.etaisyys };
      }),
    },
  };
}

async function addSafetyEquipmentFaultFeatures(features: FeaturesWithMaxFetchTime) {
  const resp = await fetchVATUByApi<TurvalaiteVikatiedotFeature>('vikatiedot');
  const faults = resp.data as TurvalaiteVikatiedotFeatureCollection;
  features.fetchedDate = String(Date.parse(resp.headers.date));
  log.debug('faults: %d', faults.features.length);
  for (const fault of faults.features) {
    features.featureArray.push({
      type: 'Feature',
      id: fault.properties.vikaId,
      geometry: fault.geometry,
      properties: {
        equipmentId: fault.properties.turvalaiteNumero,
        featureType: 'safetyequipmentfault',
        name: { fi: fault.properties.turvalaiteNimiFI, sv: fault.properties.turvalaiteNimiSV },
        type: { fi: fault.properties.vikatyyppiFI, sv: fault.properties.vikatyyppiSV, en: fault.properties.vikatyyppiEN },
        typeCode: fault.properties.vikatyyppiKoodi,
        recordTime: Date.parse(fault.properties.kirjausAika),
      },
    });
  }
}

async function addMarineWarnings(features: FeaturesWithMaxFetchTime) {
  const resp = await fetchMarineWarnings();
  features.fetchedDate = String(Date.parse(resp.headers.date));
  for (const feature of (resp.data as FeatureCollection).features) {
    const dates = parseDateTimes(feature);
    features.featureArray.push({
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

async function addVTSPointsOrLines(features: FeaturesWithMaxFetchTime, isPoint: boolean) {
  const resp = isPoint ? await fetchVTSPoints() : await fetchVTSLines();
  for (const feature of resp) {
    features.featureArray.push({
      type: feature.type,
      id: feature.id,
      geometry: feature.geometry,
      properties: {
        featureType: feature.geometry.type === 'Point' ? 'vtspoint' : 'vtsline',
        identifier: feature.properties?.IDENTIFIER,
        name: feature.properties?.OBJNAM,
        information: feature.properties?.INFORM,
        channel: feature.properties?.COMCHA?.replace(/[[\]]/g, ''),
      },
    });
  }
}

async function addMareoGraphs(features: FeaturesWithMaxFetchTime) {
  const resp = await fetchMareoGraphs();
  // dateTime is got straight from backend, so it can determine when last time data was fetched
  features.fetchedDate = String(
    resp.reduce((max, feature) => {
      return feature.dateTime > max ? feature.dateTime : max;
    }, -1)
  );

  for (const mareograph of resp) {
    features.featureArray.push({
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

async function addWeatherWaveForecast(features: FeaturesWithMaxFetchTime) {
  //Array of pilot places that do not need weather forecast
  const IGNORE_PILOT_PLACE_FORECAST: string[] = ['Juustila', 'Soskua', 'Mälkiä', 'Puumala', 'Simuna', 'Haapavesi', 'Taipaleen kanava', 'Vuokala'].map(
    (i) => i.toLowerCase()
  );

  const pilotPoints = await fetchPilotPoints();
  const { forecast, responseTime } = await fetchWeatherWaveForecast(
    pilotPoints.filter((p) => p.name.fi == null || !IGNORE_PILOT_PLACE_FORECAST.includes(p.name.fi.toLowerCase()))
  );
  features.fetchedDate = String(Date.parse(responseTime));

  for (const f of forecast) {
    features.featureArray.push({
      type: 'Feature',
      id: f.id,
      geometry: f.geometry,
      properties: {
        name: f.name,
        featureType: 'forecast',
        pilotPlaceId: f.pilotPlaceId,
        forecastItems: f.forecastItems,
      },
    });
  }
}

async function addWeatherObservations(features: FeaturesWithMaxFetchTime) {
  const resp = await fetchWeatherObservations();
  // dateTime is got straight from backend, so it can determine when last time data was fetched
  features.fetchedDate = String(
    resp.reduce((max, feature) => {
      return feature.dateTime > max ? feature.dateTime : max;
    }, -1)
  );

  for (const observation of resp) {
    features.featureArray.push({
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

async function addBuoys(features: FeaturesWithMaxFetchTime) {
  const resp = await fetchBuoys();
  // dateTime is got straight from backend, so it can determine when last time data was fetched
  features.fetchedDate = String(
    resp.reduce((max, feature) => {
      return feature.dateTime > max ? feature.dateTime : max;
    }, -1)
  );

  for (const buoy of resp) {
    features.featureArray.push({
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

async function addTurningCircleFeatures(features: FeaturesWithMaxFetchTime) {
  const circles = (await fetchVATUByApi<KaantoympyraFeature>('kaantoympyrat')).data as KaantoympyraFeatureCollection;
  log.debug('circles: %d', circles.features.length);
  for (const circle of circles.features) {
    features.featureArray.push({
      type: 'Feature',
      id: circle.properties.kaantoympyraID,
      geometry: circle.geometry,
      properties: {
        featureType: 'circle',
        diameter: circle.properties.halkaisija,
      },
    });
  }
}

function getKey(queryString: ALBEventMultiValueQueryStringParameters | undefined) {
  if (queryString) {
    const key = (queryString.type?.join(',') ?? '') + (queryString.vaylaluokka ? queryString.vaylaluokka.join(',') : '');
    if (key !== '') {
      return key;
    }
  }
  return 'noquerystring';
}

async function addFeatures(type: string, features: FeaturesWithMaxFetchTime, event: ALBEvent): Promise<boolean> {
  switch (type) {
    case 'pilot':
      await addPilotFeatures(features);
      return true;
    case 'harbor':
      await addHarborFeatures(features);
      return true;
    case 'area':
    case 'specialarea2':
      await addAreaFeatures(features, event, type, getAreaFilter(type));
      return true;
    case 'specialarea15':
      await addProhibitionAreaFeatures(features);
      return true;
    case 'restrictionarea':
      await addRestrictionAreaFeatures(features, event);
      return true;
    case 'line':
      await addLineFeatures(features, event);
      return true;
    case 'safetyequipment':
      await addSafetyEquipmentFeatures(features, event);
      return true;
    case 'safetyequipmentfault':
      await addSafetyEquipmentFaultFeatures(features);
      return true;
    case 'marinewarning':
      await addMarineWarnings(features);
      return true;
    case 'vtspoint':
      await addVTSPointsOrLines(features, true);
      return true;
    case 'vtsline':
      await addVTSPointsOrLines(features, false);
      return true;
    case 'depth':
      await addDepthFeatures(features, event);
      return true;
    case 'boardline':
      await addBoardLineFeatures(features, event);
      return true;
    case 'mareograph':
      await addMareoGraphs(features);
      return true;
    case 'observation':
      await addWeatherObservations(features);
      return true;
    case 'forecast':
      await addWeatherWaveForecast(features);
      return true;
    case 'buoy':
      await addBuoys(features);
      return true;
    case 'circle':
      await addTurningCircleFeatures(features);
      return true;
    default:
      return false;
  }
}

export const handler = async (event: ALBEvent): Promise<ALBResult> => {
  log.info({ event }, `featureloader()`);
  const key = getKey(event.multiValueQueryStringParameters);
  const type = event.multiValueQueryStringParameters?.type?.join(',') ?? '';
  let base64Response: string | undefined;
  let statusCode = 200;
  let fetchedDate = '';
  try {
    // fetched is the real time the data is fetched from api. Needed for observations, forecasts, buoys,
    // mareographs, marine warnings and safety equipment faults
    const features: FeaturesWithMaxFetchTime = { featureArray: [], fetchedDate: '' };
    const validType = await addFeatures(type, features, event);
    if (!validType) {
      log.info('Invalid type: %s', type);
      base64Response = undefined;
      statusCode = 400;
    } else {
      const collection: FeatureCollection = {
        type: 'FeatureCollection',
        features: features.featureArray,
      };
      fetchedDate = features.fetchedDate ?? '';
      // all the types that have different caching values than default (so basically features utilizing cloudfront cache)
      if (type === 'observation' || type === 'mareograph' || type === 'buoy' || type === 'forecast') {
        const responseData = JSON.stringify(collection);
        return {
          statusCode,
          body: responseData,
          isBase64Encoded: false,
          multiValueHeaders: {
            ...getWeatherResponseHeaders(),
            ...getFeatureCacheControlHeaders(key),
            'Content-Length': ['"' + new Blob([responseData]).size + '"'],
            fetchedDate: [fetchedDate],
          },
        };
      }
      base64Response = await toBase64Response(collection);
    }
  } catch (e) {
    base64Response = undefined;
    statusCode = 503;
  }
  return {
    statusCode,
    body: base64Response,
    isBase64Encoded: true,
    multiValueHeaders: {
      ...getHeaders(),
      ...getFeatureCacheControlHeaders(key),
      'Content-Type': ['application/geo+json'],
      fetchedDate: [fetchedDate],
    },
  };
};
