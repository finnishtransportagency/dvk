import { ALBEvent, ALBEventMultiValueQueryStringParameters, ALBResult } from 'aws-lambda';
import { getHeaders, getWeatherResponseHeaders } from '../environment';
import { log } from '../logger';
import { Feature, FeatureCollection, Geometry, GeoJsonProperties } from 'geojson';
import { fetchVATUByFairwayClass } from '../graphql/query/vatu';
import HarborDBModel from '../db/harborDBModel';
import { parseDateTimes } from './pooki';
import { fetchBuoys, fetchMareoGraphs, fetchWeatherObservations } from './weather';
import { fetchPilotPoints, fetchProhibitionAreas, fetchVTSLines, fetchVTSPoints } from './traficom';
import { getFeatureCacheControlHeaders } from '../graphql/cache';
import { fetchVATUByApi, fetchMarineWarnings } from './axios';
import { getNumberValue, invertDegrees, roundDecimals, toBase64Response } from '../util';
import {
  AlueAPIModel,
  AlueFeature,
  AlueFeatureCollection,
  KaantoympyraAPIModel,
  NavigointiLinjaAPIModel,
  NavigointiLinjaFeature,
  NavigointiLinjaFeatureCollection,
  RajoitusAlueAPIModel,
  TaululinjaAPIModel,
  TurvalaiteAPIModel,
  TurvalaiteFeature,
  TurvalaiteFeatureCollection,
  TurvalaiteVikatiedotAPIModel,
  VaylaGeojsonFeature,
} from './apiModels';

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
  const pilotPlaces = await fetchPilotPoints();
  for (const place of pilotPlaces) {
    features.featureArray.push({
      type: 'Feature',
      geometry: place.geometry as Geometry,
      id: place.id,
      properties: {
        featureType: 'pilot',
        name: place.name,
      },
    });
  }
}

async function addDepthFeatures(features: FeaturesWithMaxFetchTime, event: ALBEvent) {
  const apiAreas = (await fetchVATUByFairwayClass<AlueAPIModel | AlueFeature>('vaylaalueet', event)).data as AlueAPIModel[] | AlueFeatureCollection;
  const areas = 'features' in apiAreas ? apiAreas.features : apiAreas;
  log.debug('areas: %d', areas.length);
  for (const area of areas.filter((a) => filterArea(a, [1, 2, 3, 4, 5, 11]))) {
    features.featureArray.push(mapAreaFeature(area));
  }
}

function filterArea(area: AlueAPIModel | AlueFeature, types: number[]): boolean {
  const areaProperties = 'properties' in area ? area.properties : area;
  return types.includes(areaProperties.tyyppiKoodi as number);
}

function mapAreaFeature(apiArea: AlueAPIModel | AlueFeature): Feature {
  const area = 'properties' in apiArea ? apiArea.properties : apiArea;
  return {
    type: 'Feature',
    id: area.id,
    geometry: 'geometry' in apiArea ? apiArea.geometry : (apiArea.geometria as Geometry),
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
  };
}

// 1 = Navigointialue, 3 = Ohitus- ja kohtaamisalue, 4 = Satama-allas, 5 = Kääntöallas, 11 = Varmistettu lisäalue
// 2 = Ankkurointialue
const navigationAreaFilter = (area: AlueAPIModel | AlueFeature) => {
  return filterArea(area, [1, 3, 4, 5, 11]);
};
const anchoringAreaFilter = (area: AlueAPIModel | AlueFeature) => {
  return filterArea(area, [2]);
};

function getAreaFilter(type: 'area' | 'specialarea2') {
  if (type === 'area') {
    return navigationAreaFilter;
  } else {
    return anchoringAreaFilter;
  }
}

async function addAreaFeatures(
  features: FeaturesWithMaxFetchTime,
  event: ALBEvent,
  featureType: string,
  areaFilter: (a: AlueAPIModel | AlueFeature) => boolean
) {
  const apiAreas = (await fetchVATUByFairwayClass<AlueAPIModel | AlueFeature>('vaylaalueet', event)).data as AlueAPIModel[] | AlueFeatureCollection;
  const areas = 'features' in apiAreas ? apiAreas.features : apiAreas;
  log.debug('areas: %d', areas.length);

  for (const a of areas.filter(areaFilter)) {
    const area = 'properties' in a ? a.properties : a;
    features.featureArray.push({
      type: 'Feature',
      id: area.id,
      geometry: 'geometry' in a ? a.geometry : (a.geometria as Geometry),
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
  const areas = await fetchProhibitionAreas();
  log.debug('prohibition areas: %d', areas.length);
  features.featureArray.push(...areas);
}

async function addRestrictionAreaFeatures(features: FeaturesWithMaxFetchTime, event: ALBEvent) {
  const areas = (await fetchVATUByFairwayClass<RajoitusAlueAPIModel>('rajoitusalueet', event)).data as RajoitusAlueAPIModel[];
  log.debug('areas: %d', areas.length);
  for (const area of areas.filter(
    (a) => a.rajoitustyyppi === 'Nopeusrajoitus' || (a.rajoitustyypit?.filter((b) => b.rajoitustyyppi === 'Nopeusrajoitus')?.length ?? 0) > 0
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
          }) ?? [],
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
    features.featureArray.push(feature);
  }
}

async function addBoardLineFeatures(features: FeaturesWithMaxFetchTime, event: ALBEvent) {
  const lines = (await fetchVATUByFairwayClass<TaululinjaAPIModel>('taululinjat', event)).data as TaululinjaAPIModel[];
  log.debug('board lines: %d', lines.length);
  for (const line of lines) {
    features.featureArray.push({
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
          };
        }),
      },
    });
  }
}

async function addLineFeatures(features: FeaturesWithMaxFetchTime, event: ALBEvent) {
  const lines = (await fetchVATUByFairwayClass<NavigointiLinjaAPIModel | NavigointiLinjaFeature>('navigointilinjat', event)).data as
    | NavigointiLinjaAPIModel[]
    | NavigointiLinjaFeatureCollection;
  const lineFeatures = 'features' in lines ? lines.features : lines;
  log.debug('lines: %d', lineFeatures.length);
  for (const line of lineFeatures) {
    features.featureArray.push(mapLineFeature(line));
  }
}

function mapLineFeature(apiLine: NavigointiLinjaAPIModel | NavigointiLinjaFeature): Feature {
  const line = 'properties' in apiLine ? apiLine.properties : apiLine;
  return {
    type: 'Feature',
    id: line.id,
    geometry: 'geometry' in apiLine ? apiLine.geometry : (apiLine.geometria as Geometry),
    properties: {
      id: line.id,
      featureType: 'line',
      depth: getNumberValue(line.harausSyvyys),
      direction: roundDecimals(line.tosisuunta, 1) ?? undefined,
      oppositeDirection: roundDecimals(invertDegrees(line.tosisuunta), 1) ?? undefined,
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
          status: v.status,
          line: v.linjaus,
        };
      }),
    },
  };
}

async function addSafetyEquipmentFeatures(features: FeaturesWithMaxFetchTime, event: ALBEvent) {
  const equipments = (await fetchVATUByFairwayClass<TurvalaiteAPIModel | TurvalaiteFeature>('turvalaitteet', event)).data as
    | TurvalaiteAPIModel[]
    | TurvalaiteFeatureCollection;

  const equipmentFeatures = 'features' in equipments ? equipments.features : equipments;
  log.debug('lines: %d', equipmentFeatures.length);
  for (const equipment of equipmentFeatures) {
    features.featureArray.push(mapSafetyEquipmentFeature(equipment));
  }
}

function mapSafetyEquipmentFeature(apiEquipment: TurvalaiteAPIModel | TurvalaiteFeature): Feature {
  const equipment = 'properties' in apiEquipment ? apiEquipment.properties : apiEquipment;
  return {
    type: 'Feature',
    id: equipment.turvalaitenumero,
    geometry: 'geometry' in apiEquipment ? apiEquipment.geometry : (apiEquipment.geometria as Geometry),
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
        return { fairwayId: v.jnro, primary: v.paavayla === 'P' };
      }),
      distances: equipment.reunaetaisyys?.map((v) => {
        return { areaId: v.vaylaalueID, distance: v.etaisyys };
      }),
    },
  };
}

async function addSafetyEquipmentFaultFeatures(features: FeaturesWithMaxFetchTime) {
  const resp = await fetchVATUByApi<TurvalaiteVikatiedotAPIModel>('vikatiedot');
  const faults = resp.data as TurvalaiteVikatiedotAPIModel[];
  features.fetchedDate = String(Date.parse(resp.headers.date));
  log.debug('faults: %d', faults.length);
  for (const fault of faults) {
    features.featureArray.push({
      type: 'Feature',
      id: fault.vikaId,
      geometry: fault.geometria as Geometry,
      properties: {
        equipmentId: fault.turvalaiteNumero,
        featureType: 'safetyequipmentfault',
        name: { fi: fault.turvalaiteNimiFI, sv: fault.turvalaiteNimiSV },
        type: { fi: fault.vikatyyppiFI, sv: fault.vikatyyppiSV, en: fault.vikatyyppiEN },
        typeCode: fault.vikatyyppiKoodi,
        recordTime: Date.parse(fault.kirjausAika),
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
  const circles = (await fetchVATUByApi<KaantoympyraAPIModel>('kaantoympyrat')).data as KaantoympyraAPIModel[];
  log.debug('circles: %d', circles.length);
  for (const circle of circles) {
    features.featureArray.push({
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
    // fetched is the real time the data is fetched from api. Needed for observations, buyos,
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
      if (type === 'observation' || type === 'mareograph' || type === 'buoy') {
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
