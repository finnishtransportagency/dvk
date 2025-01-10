import { AppSyncResolverEvent, AppSyncResolverHandler } from 'aws-lambda';
import {
  Area,
  Boardline,
  Fairway,
  FairwayCard,
  GeometryLine,
  GeometryPolygon,
  NavigationLine,
  ProhibitionArea,
  QueryFairwayCardArgs,
  RestrictionArea,
  TurningCircle,
} from '../../../../graphql/generated';
import { log } from '../../logger';
import { fetchVATUByFairwayId } from './vatu';
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
  VaylaFeature,
  VaylaFeatureCollection,
  VaylaGeojsonFeature,
} from '../../api/apiModels';
import { fetchProhibitionAreas } from '../../api/traficom';
import { cacheResponse, getFromCache } from '../../s3Cache';

export function mapAPIModelToFairway(apiModel: VaylaFeature): Fairway {
  const fairway: Fairway = {
    id: apiModel.properties.jnro,
    name: {
      fi: apiModel.properties.nimiFI ?? '',
      sv: apiModel.properties.nimiSV ?? '',
    },
    sizing: {
      additionalInformation: apiModel.properties.lisatieto,
      mareograph: apiModel.properties.mareografi,
      minimumTurningCircle: apiModel.properties.minimiKaantosade,
      minimumWidth: apiModel.properties.minimiLeveys,
      normalTurningCircle: apiModel.properties.normaaliKaantosade,
      normalWidth: apiModel.properties.normaaliLeveys,
      reserveWater: apiModel.properties.varavesi,
    },
    typeCode: apiModel.properties.vaylalajiKoodi,
    type: {
      fi: apiModel.properties.vaylaLajiFI,
      sv: apiModel.properties.vaylaLajiSV,
    },
    area: {
      fi: apiModel.properties.merialueFI,
      sv: apiModel.properties.merialueSV,
    },
    lightingCode: apiModel.properties.valaistusKoodi,
    lighting: {
      fi: apiModel.properties.valaistusFI,
      sv: apiModel.properties.valaistusSV,
    },
    owner: apiModel.properties.omistaja,
    startText: apiModel.properties.alunSeloste,
    endText: apiModel.properties.paatepisteenSeloste,
  };
  fairway.sizingVessels = apiModel.properties.mitoitusalus?.map((vesselModel) => {
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
  fairway.classifications = apiModel.properties.luokitus?.map((classificationModel) => {
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
  const apiLines = (await fetchVATUByFairwayId<NavigointiLinjaFeature>(fairwayIds, 'navigointilinjat')).data as NavigointiLinjaFeatureCollection;
  let lineMap = null;
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

  return lineMap;
}

function mapNavigationLines(lines: NavigointiLinjaFeature[]) {
  return lines.map((apiLine) => {
    return mapNavigationLine(apiLine);
  });
}

function mapNavigationLine(line: NavigointiLinjaFeature) {
  const mappedLine: NavigationLine = {
    id: line.properties.id,
    draft: line.properties.mitoitusSyvays,
    depth: line.properties.harausSyvyys,
    referenceLevel: line.properties.vertaustaso,
    n2000draft: line.properties.n2000MitoitusSyvays,
    n2000depth: line.properties.n2000HarausSyvyys,
    n2000ReferenceLevel: line.properties.n2000Vertaustaso,
    direction: line.properties.tosisuunta,
    length: line.properties.pituus,
    additionalInformation: line.properties.lisatieto,
    owner: line.properties.omistaja,
    verificationDate: line.properties.vahvistusPaivamaara,
    journalNumber: line.properties.diaariNumero,
    type: line.properties.tyyppi,
    typeCode: line.properties.tyyppiKoodi,
    fairways: line.properties.vayla?.map((apiFairway) => {
      return {
        fairwayId: apiFairway.jnro,
        status: apiFairway.status,
        line: apiFairway.linjaus,
      };
    }),
    geometry: line.geometry as GeometryLine,
  };
  return mappedLine;
}

async function getAreaMap(fairwayIds: number[]) {
  const apiAreas = (await fetchVATUByFairwayId<VaylaGeojsonFeature>(fairwayIds, 'vaylaalueet')).data as AlueFeatureCollection;
  const areas = apiAreas.features.filter((a) => a.properties.tyyppiKoodi !== 15); // Filter specialarea15, fetched separately from Traficom
  log.debug('areas: %d', areas.length);
  const areaMap = new Map<number, AlueFeature[]>();
  for (const area of areas) {
    for (const areaFairway of area.properties.vayla ?? []) {
      if (!areaMap.has(areaFairway.jnro)) {
        areaMap.set(areaFairway.jnro, []);
      }
      areaMap.get(areaFairway.jnro)?.push(area);
    }
  }
  return areaMap;
}

function mapAreas(areas: AlueFeature[]) {
  return areas.map((apiArea) => {
    const area: Area = {
      id: apiArea.properties.id,
      name: apiArea.properties.nimi,
      draft: apiArea.properties.mitoitusSyvays,
      depth: apiArea.properties.harausSyvyys,
      referenceLevel: apiArea.properties.vertaustaso,
      n2000draft: apiArea.properties.n2000MitoitusSyvays,
      n2000depth: apiArea.properties.n2000HarausSyvyys,
      n2000ReferenceLevel: apiArea.properties.n2000Vertaustaso,
      direction: apiArea.properties.suunta,
      journalNumber: apiArea.properties.diaariNumero,
      verificationDate: apiArea.properties.vahvistusPaivamaara,
      owner: apiArea.properties.omistaja,
      additionalInformation: apiArea.properties.lisatieto,
      typeCode: apiArea.properties.tyyppiKoodi,
      type: apiArea.properties.tyyppi,
      notationCode: apiArea.properties.merkintalajiKoodi,
      notation: apiArea.properties.merkintalaji,
      operationStatusCode: apiArea.properties.liikennointiStatusKoodi,
      operationStatus: apiArea.properties.liikennointiStatus,
      operationTypeCode: apiArea.properties.liikennointiTyyppiKoodi,
      operationType: apiArea.properties.liikenteenTyyppi,
      operationDirectionCode: apiArea.properties.liikennointiSuuntaKoodi,
      operationDirection: apiArea.properties.liikennointiSuunta,
      geometry: apiArea.geometry as GeometryPolygon,
    };
    area.fairways = apiArea.properties.vayla?.map((apiFairway) => {
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

function mapRestrictionAreas(areas: RajoitusAlueFeature[]) {
  return areas.map((apiArea) => {
    const area: RestrictionArea = {
      id: apiArea.properties.id,
      value: apiArea.properties.suuruus,
      presenter: apiArea.properties.esittaja,
      journalNumber: apiArea.properties.diaariNumero,
      verificationDate: apiArea.properties.vahvistusPaivamaara,
      modificationDate: apiArea.properties.muutosPaivamaara,
      startDate: apiArea.properties.alkuPaivamaara,
      endDate: apiArea.properties.loppuPaivamaara,
      status: apiArea.properties.paatosTila,
      source: apiArea.properties.tietolahde,
      location: apiArea.properties.sijainti,
      municipality: apiArea.properties.kunta,
      exception: apiArea.properties.poikkeus,
      geometry: apiArea.geometry as GeometryPolygon,
    };
    area.fairways = apiArea.properties.vayla?.map((apiFairway) => {
      return {
        fairwayId: apiFairway.jnro,
      };
    });
    area.types =
      apiArea.properties.rajoitustyypit?.map((t) => {
        return { code: t.koodi, text: t.rajoitustyyppi };
      }) ?? [];
    if (apiArea.properties.rajoitustyyppi) {
      area.types.push({ text: apiArea.properties.rajoitustyyppi });
    }
    return area;
  });
}

async function getRestrictionAreaMap(fairwayIds: number[]) {
  const areas = (await fetchVATUByFairwayId<RajoitusAlueFeature>(fairwayIds, 'rajoitusalueet')).data as RajoitusAlueFeatureCollection;
  log.debug('restriction areas: %d', areas.features.length);
  const areaMap = new Map<number, RajoitusAlueFeature[]>();
  for (const area of areas.features) {
    for (const areaFairway of area.properties.vayla ?? []) {
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

function mapBoardLines(lines: TaululinjaFeature[]): Boardline[] {
  return lines.map((line) => {
    const boardLine: Boardline = {
      id: line.properties.taululinjaId,
      direction: line.properties.suunta,
      geometry: line.geometry as GeometryLine,
    };
    boardLine.fairways = line.properties.vayla?.map((apiFairway) => {
      return {
        fairwayId: apiFairway.jnro,
      };
    });
    return boardLine;
  });
}

async function getBoardLineMap(fairwayIds: number[]) {
  const lines = (await fetchVATUByFairwayId<TaululinjaFeature>(fairwayIds, 'taululinjat')).data as TaululinjaFeatureCollection;
  log.debug('board lines: %d', lines.features.length);
  const lineMap = new Map<number, TaululinjaFeature[]>();
  for (const line of lines.features) {
    for (const lineFairway of line.properties.vayla || []) {
      if (!lineMap.has(lineFairway.jnro)) {
        lineMap.set(lineFairway.jnro, []);
      }
      lineMap.get(lineFairway.jnro)?.push(line);
    }
  }
  return lineMap;
}

function mapTurningCircles(circles: KaantoympyraFeature[]): TurningCircle[] {
  return circles.map((circle) => {
    const turningCircle: TurningCircle = {
      id: circle.properties.kaantoympyraID,
      geometry: circle.geometry as GeometryLine,
      diameter: circle.properties.halkaisija,
    };
    turningCircle.fairways = circle.properties.vayla?.map((apiFairway) => {
      return {
        fairwayId: apiFairway.jnro,
      };
    });
    return turningCircle;
  });
}

async function getCircleMap(fairwayIds: number[]) {
  const circles = (await fetchVATUByFairwayId<KaantoympyraFeature>(fairwayIds, 'kaantoympyrat')).data as KaantoympyraFeatureCollection;
  log.debug('circles: %d', circles.features.length);
  const circleMap = new Map<number, KaantoympyraFeature[]>();
  for (const circle of circles.features) {
    for (const circleFairway of circle.properties.vayla ?? []) {
      if (!circleMap.has(circleFairway.jnro)) {
        circleMap.set(circleFairway.jnro, []);
      }
      circleMap.get(circleFairway.jnro)?.push(circle);
    }
  }
  return circleMap;
}

function getKey(fairwayIds?: number[]) {
  return 'fairways:' + fairwayIds?.join(':');
}

export const handler: AppSyncResolverHandler<QueryFairwayCardArgs, Fairway[], FairwayCard> = async (
  event: AppSyncResolverEvent<QueryFairwayCardArgs, FairwayCard>
): Promise<Fairway[]> => {
  log.info(`fairwayCardFairways(${event.source.id})`);
  // make sure that there's no undefined values in array
  const fairwayIds = event.source.fairways?.filter((f): f is { id: number } => f.id !== undefined).map((f) => f.id) ?? [];
  log.debug(`fairwayIds: ${fairwayIds}`);
  const key = getKey(fairwayIds);
  const cacheResponseData = await getFromCache(key);
  if (!cacheResponseData.expired && cacheResponseData.data) {
    log.debug('returning fairways from cache');
    return JSON.parse(cacheResponseData.data);
  } else {
    try {
      if (fairwayIds.length > 0) {
        const fairwayMap = new Map<number, Fairway>();
        event.source.fairways?.forEach((f) => {
          if (f.id) {
            fairwayMap.set(f.id, f);
          }
        });
        const lineMap = await getNavigationLineMap(fairwayIds);
        const areaMap = await getAreaMap(fairwayIds);
        const restrictionAreaMap = await getRestrictionAreaMap(fairwayIds);
        const prohibitionAreaMap = await getProhibitionAreaMap();
        const boardLineMap = await getBoardLineMap(fairwayIds);
        const circleMap = await getCircleMap(fairwayIds);
        const fairways = (await fetchVATUByFairwayId<VaylaFeature>(fairwayIds, 'vaylat')).data as VaylaFeatureCollection;
        const response = fairways.features.map((apiFairway) => {
          const fairway = fairwayMap.get(apiFairway.properties.jnro);
          log.debug('Fairway: %o', apiFairway);
          return {
            ...mapAPIModelToFairway(apiFairway),
            ...fairway,
            navigationLines: mapNavigationLines(lineMap?.get(apiFairway.properties.jnro) ?? []),
            areas: mapAreas(areaMap.get(apiFairway.properties.jnro) ?? []),
            restrictionAreas: mapRestrictionAreas(restrictionAreaMap.get(apiFairway.properties.jnro) ?? []),
            prohibitionAreas: prohibitionAreaMap.get(apiFairway.properties.jnro) ?? [],
            boardLines: mapBoardLines(boardLineMap.get(apiFairway.properties.jnro) ?? []),
            turningCircles: mapTurningCircles(circleMap.get(apiFairway.properties.jnro) ?? []),
          };
        });
        await cacheResponse(key, response);
        return response;
      } else {
        return [];
      }
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
