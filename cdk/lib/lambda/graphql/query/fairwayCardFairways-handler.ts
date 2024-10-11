import { AppSyncResolverEvent, AppSyncResolverHandler } from 'aws-lambda';
import {
  Area,
  Boardline,
  Fairway,
  FairwayCard,
  NavigationLine,
  ProhibitionArea,
  QueryFairwayCardArgs,
  RestrictionArea,
  TurningCircle,
} from '../../../../graphql/generated';
import { log } from '../../logger';
import { fetchVATUByFairwayId } from './vatu';
import { cacheResponse, getFromCache } from '../cache';
import {
  AlueAPIModel,
  KaantoympyraAPIModel,
  NavigointiLinjaAPIModel,
  NavigointiLinjaFeature,
  NavigointiLinjaFeatureCollection,
  RajoitusAlueAPIModel,
  TaululinjaAPIModel,
  VaylaAPIModel,
} from '../../api/apiModels';
import { fetchProhibitionAreas } from '../../api/traficom';

export function mapAPIModelToFairway(apiModel: VaylaAPIModel): Fairway {
  const fairway: Fairway = {
    id: apiModel.jnro,
    name: {
      fi: apiModel.nimiFI ?? '',
      sv: apiModel.nimiSV ?? '',
    },
    sizing: {
      additionalInformation: apiModel.lisatieto,
      mareograph: apiModel.mareografi,
      minimumTurningCircle: apiModel.minimiKaantosade,
      minimumWidth: apiModel.minimiLeveys,
      normalTurningCircle: apiModel.normaaliKaantosade,
      normalWidth: apiModel.normaaliLeveys,
      reserveWater: apiModel.varavesi,
    },
    typeCode: apiModel.vaylalajiKoodi,
    type: {
      fi: apiModel.vaylaLajiFI,
      sv: apiModel.vaylaLajiSV,
    },
    area: {
      fi: apiModel.merialueFI,
      sv: apiModel.merialueSV,
    },
    lightingCode: apiModel.valaistusKoodi,
    lighting: {
      fi: apiModel.valaistusFI,
      sv: apiModel.valaistusSV,
    },
    owner: apiModel.omistaja,
    startText: apiModel.alunSeloste,
    endText: apiModel.paatepisteenSeloste,
  };
  fairway.sizingVessels = apiModel.mitoitusalus?.map((vesselModel) => {
    return {
      typeCode: vesselModel.alustyyppiKoodi,
      type: vesselModel.alustyyppi,
      draft: vesselModel.syvays,
      length: vesselModel.pituus,
      width: vesselModel.leveys,
      bodyFactor: vesselModel.runkoTaytelaisyysKerroin,
      size: vesselModel.koko,
    };
  });
  fairway.classifications = apiModel.luokitus?.map((classificationModel) => {
    return {
      type: classificationModel.luokitusTyyppi,
      fairwayClassCode: classificationModel.vaylaluokkaKoodi,
      fairwayClass: {
        fi: classificationModel.vaylaluokkaFI,
        sv: classificationModel.vaylaluokkaSV,
      },
    };
  });
  return fairway;
}

async function getNavigationLineMap(fairwayIds: number[]) {
  const apiLines = (await fetchVATUByFairwayId<NavigointiLinjaAPIModel | NavigointiLinjaFeature>(fairwayIds, 'navigointilinjat')).data as
    | NavigointiLinjaAPIModel[]
    | NavigointiLinjaFeatureCollection;
  const isGeoJson = 'features' in apiLines;
  let lineMap = null;
  if (isGeoJson) {
    const lines = apiLines.features;
    log.debug('lines: %d', lines.length);
    lineMap = new Map<number, NavigointiLinjaFeature[]>();
    for (const line of lines) {
      for (const lineFairway of line.properties.vayla) {
        if (!lineMap.has(lineFairway.jnro)) {
          lineMap.set(lineFairway.jnro, []);
        }
        lineMap.get(lineFairway.jnro)?.push(line);
      }
    }
  } else {
    //For some reason the compiler doesn't like these 2 blocks to be merged. Keep them separate and delete this one when we move to V2 API
    const lines = apiLines;
    log.debug('lines: %d', lines.length);
    lineMap = new Map<number, NavigointiLinjaAPIModel[]>();
    for (const line of lines) {
      for (const lineFairway of line.vayla) {
        if (!lineMap.has(lineFairway.jnro)) {
          lineMap.set(lineFairway.jnro, []);
        }
        lineMap.get(lineFairway.jnro)?.push(line);
      }
    }
  }

  return lineMap;
}

function mapNavigationLines(lines: NavigointiLinjaAPIModel[] | NavigointiLinjaFeature[]) {
  return lines.map((apiLine) => {
    return mapNavigationLine(apiLine);
  });
}

function mapNavigationLine(line: NavigointiLinjaAPIModel | NavigointiLinjaFeature) {
  const apiLine = 'properties' in line ? line.properties : line;
  let mappedLine: NavigationLine = {
    id: apiLine.id,
    draft: apiLine.mitoitusSyvays,
    depth: apiLine.harausSyvyys,
    referenceLevel: apiLine.vertaustaso,
    n2000draft: apiLine.n2000MitoitusSyvays,
    n2000depth: apiLine.n2000HarausSyvyys,
    n2000ReferenceLevel: apiLine.n2000Vertaustaso,
    direction: apiLine.tosisuunta,
    length: apiLine.pituus,
    additionalInformation: apiLine.lisatieto,
    owner: apiLine.omistaja,
    verificationDate: apiLine.vahvistusPaivamaara,
    journalNumber: apiLine.diaariNumero,
    type: apiLine.tyyppi,
    typeCode: apiLine.tyyppiKoodi,
    fairways: [],
  };
  mappedLine.geometry = 'geometry' in line ? line.geometry : line.geometria;
  mappedLine.fairways = apiLine.vayla?.map((apiFairway) => {
    return {
      fairwayId: apiFairway.jnro,
      status: apiFairway.status,
      line: apiFairway.linjaus,
    };
  });
  return mappedLine;
}

async function getAreaMap(fairwayIds: number[]) {
  const apiAreas = (await fetchVATUByFairwayId<AlueAPIModel>(fairwayIds, 'vaylaalueet')).data as AlueAPIModel[];
  const areas = apiAreas.filter((a) => a.tyyppiKoodi !== 15); // Filter specialarea15, fetched separately from Traficom
  log.debug('areas: %d', areas.length);
  const areaMap = new Map<number, AlueAPIModel[]>();
  for (const area of areas) {
    for (const areaFairway of area.vayla ?? []) {
      if (!areaMap.has(areaFairway.jnro)) {
        areaMap.set(areaFairway.jnro, []);
      }
      areaMap.get(areaFairway.jnro)?.push(area);
    }
  }
  return areaMap;
}

function mapAreas(areas: AlueAPIModel[]) {
  return areas.map((apiArea) => {
    const area: Area = {
      id: apiArea.id,
      name: apiArea.nimi,
      draft: apiArea.mitoitusSyvays,
      depth: apiArea.harausSyvyys,
      referenceLevel: apiArea.vertaustaso,
      n2000draft: apiArea.n2000MitoitusSyvays,
      n2000depth: apiArea.n2000HarausSyvyys,
      n2000ReferenceLevel: apiArea.n2000Vertaustaso,
      direction: apiArea.suunta,
      journalNumber: apiArea.diaariNumero,
      verificationDate: apiArea.vahvistusPaivamaara,
      owner: apiArea.omistaja,
      additionalInformation: apiArea.lisatieto,
      typeCode: apiArea.tyyppiKoodi,
      type: apiArea.tyyppi,
      notationCode: apiArea.merkintalajiKoodi,
      notation: apiArea.merkintalaji,
      operationStatusCode: apiArea.liikennointiStatusKoodi,
      operationStatus: apiArea.liikennointiStatus,
      operationTypeCode: apiArea.liikennointiTyyppiKoodi,
      operationType: apiArea.liikenteenTyyppi,
      operationDirectionCode: apiArea.liikennointiSuuntaKoodi,
      operationDirection: apiArea.liikennointiSuunta,
      geometry: apiArea.geometria,
    };
    area.fairways = apiArea.vayla?.map((apiFairway) => {
      return {
        fairwayId: apiFairway.jnro,
        line: apiFairway.linjaus,
        status: apiFairway.status,
        sizingSpeed: apiFairway.mitoitusNopeus,
        sizingSpeed2: apiFairway.mitoitusNopeus2,
        sequenceNumber: apiFairway.vaylaalueenJarjestysNro,
      };
    });
    return area;
  });
}

function mapRestrictionAreas(areas: RajoitusAlueAPIModel[]) {
  return areas.map((apiArea) => {
    const area: RestrictionArea = {
      id: apiArea.id,
      value: apiArea.suuruus,
      presenter: apiArea.esittaja,
      journalNumber: apiArea.diaariNumero,
      verificationDate: apiArea.vahvistusPaivamaara,
      modificationDate: apiArea.muutosPaivamaara,
      startDate: apiArea.alkuPaivamaara,
      endDate: apiArea.loppuPaivamaara,
      status: apiArea.paatosTila,
      source: apiArea.tietolahde,
      location: apiArea.sijainti,
      municipality: apiArea.kunta,
      exception: apiArea.poikkeus,
      geometry: apiArea.geometria,
    };
    area.fairways = apiArea.vayla?.map((apiFairway) => {
      return {
        fairwayId: apiFairway.jnro,
      };
    });
    area.types =
      apiArea.rajoitustyypit?.map((t) => {
        return { code: t.koodi, text: t.rajoitustyyppi };
      }) ?? [];
    if (apiArea.rajoitustyyppi) {
      area.types.push({ text: apiArea.rajoitustyyppi });
    }
    return area;
  });
}

async function getRestrictionAreaMap(fairwayIds: number[]) {
  const areas = (await fetchVATUByFairwayId<RajoitusAlueAPIModel>(fairwayIds, 'rajoitusalueet')).data as RajoitusAlueAPIModel[];
  log.debug('restriction areas: %d', areas.length);
  const areaMap = new Map<number, RajoitusAlueAPIModel[]>();
  for (const area of areas) {
    for (const areaFairway of area.vayla ?? []) {
      if (!areaMap.has(areaFairway.jnro)) {
        areaMap.set(areaFairway.jnro, []);
      }
      areaMap.get(areaFairway.jnro)?.push(area);
    }
  }
  return areaMap;
}

async function getProhibitionAreaMap() {
  const areas = await fetchProhibitionAreas();
  log.debug('prohibition areas: %d', areas.length);
  const areaMap = new Map<number, ProhibitionArea[]>();
  for (const area of areas) {
    const fairway = area.properties?.fairway;
    if (!areaMap.has(fairway.fairwayId)) {
      areaMap.set(fairway.fairwayId, []);
    }
    areaMap.get(fairway.fairwayId)?.push({
      id: area.id as number,
      typeCode: area.properties?.typeCode,
      extraInfo: area.properties?.extraInfo,
      fairway: area.properties?.fairway,
    });
  }
  return areaMap;
}

function mapBoardLines(lines: TaululinjaAPIModel[]): Boardline[] {
  return lines.map((line) => {
    const boardLine: Boardline = {
      id: line.taululinjaId,
      direction: line.suunta,
      geometry: line.geometria,
    };
    boardLine.fairways = line.vayla?.map((apiFairway) => {
      return {
        fairwayId: apiFairway.jnro,
      };
    });
    return boardLine;
  });
}

async function getBoardLineMap(fairwayIds: number[]) {
  const lines = (await fetchVATUByFairwayId<TaululinjaAPIModel>(fairwayIds, 'taululinjat')).data as TaululinjaAPIModel[];
  log.debug('board lines: %d', lines.length);
  const lineMap = new Map<number, TaululinjaAPIModel[]>();
  for (const line of lines) {
    for (const lineFairway of line.vayla || []) {
      if (!lineMap.has(lineFairway.jnro)) {
        lineMap.set(lineFairway.jnro, []);
      }
      lineMap.get(lineFairway.jnro)?.push(line);
    }
  }
  return lineMap;
}

function mapTurningCircles(circles: KaantoympyraAPIModel[]): TurningCircle[] {
  return circles.map((circle) => {
    const turningCircle: TurningCircle = {
      id: circle.kaantoympyraID,
      geometry: circle.geometria,
      diameter: circle.halkaisija,
    };
    turningCircle.fairways = circle.vayla?.map((apiFairway) => {
      return {
        fairwayId: apiFairway.jnro,
      };
    });
    return turningCircle;
  });
}

async function getCircleMap(fairwayIds: number[]) {
  const circles = (await fetchVATUByFairwayId<KaantoympyraAPIModel>(fairwayIds, 'kaantoympyrat')).data as KaantoympyraAPIModel[];
  log.debug('circles: %d', circles.length);
  const circleMap = new Map<number, KaantoympyraAPIModel[]>();
  for (const circle of circles) {
    for (const circleFairway of circle.vayla ?? []) {
      if (!circleMap.has(circleFairway.jnro)) {
        circleMap.set(circleFairway.jnro, []);
      }
      circleMap.get(circleFairway.jnro)?.push(circle);
    }
  }
  return circleMap;
}

function getKey(fairwayIds: number[]) {
  return 'fairways:' + fairwayIds.join(':');
}

export const handler: AppSyncResolverHandler<QueryFairwayCardArgs, Fairway[], FairwayCard> = async (
  event: AppSyncResolverEvent<QueryFairwayCardArgs, FairwayCard>
): Promise<Fairway[]> => {
  log.info(`fairwayCardFairways(${event.source.id})`);
  const fairwayIds = event.source.fairways.map((f) => f.id);
  log.debug(`fairwayIds: ${fairwayIds}`);
  const key = getKey(fairwayIds);
  const cacheResponseData = await getFromCache(key);
  if (!cacheResponseData.expired && cacheResponseData.data) {
    log.debug('returning fairways from cache');
    return JSON.parse(cacheResponseData.data);
  } else {
    try {
      const fairwayMap = new Map<number, Fairway>();
      event.source.fairways.forEach((f) => {
        fairwayMap.set(f.id, f);
      });
      const lineMap = await getNavigationLineMap(fairwayIds);
      const areaMap = await getAreaMap(fairwayIds);
      const restrictionAreaMap = await getRestrictionAreaMap(fairwayIds);
      const prohibitionAreaMap = await getProhibitionAreaMap();
      const boardLineMap = await getBoardLineMap(fairwayIds);
      const circleMap = await getCircleMap(fairwayIds);
      const fairways = (await fetchVATUByFairwayId<VaylaAPIModel>(fairwayIds, 'vaylat')).data as VaylaAPIModel[];
      const response = fairways.map((apiFairway) => {
        const fairway = fairwayMap.get(apiFairway.jnro);
        log.debug('Fairway: %o', apiFairway);
        return {
          ...mapAPIModelToFairway(apiFairway),
          ...fairway,
          navigationLines: mapNavigationLines(lineMap?.get(apiFairway.jnro) ?? []),
          areas: mapAreas(areaMap.get(apiFairway.jnro) ?? []),
          restrictionAreas: mapRestrictionAreas(restrictionAreaMap.get(apiFairway.jnro) ?? []),
          prohibitionAreas: prohibitionAreaMap.get(apiFairway.jnro) ?? [],
          boardLines: mapBoardLines(boardLineMap.get(apiFairway.jnro) ?? []),
          turningCircles: mapTurningCircles(circleMap.get(apiFairway.jnro) ?? []),
        };
      });
      await cacheResponse(key, response);
      return response;
    } catch (e) {
      log.error('Getting fairways failed: %s', e);
      if (cacheResponseData.data) {
        log.warn('Returning expired response from s3 cache');
        return JSON.parse(cacheResponseData.data);
      } else {
        throw e;
      }
    }
  }
};
