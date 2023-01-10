import { AppSyncResolverEvent, AppSyncResolverHandler } from 'aws-lambda';
import { Area, Fairway, FairwayCard, NavigationLine, QueryFairwayCardArgs, RestrictionArea } from '../../../../graphql/generated';
import { log } from '../../logger';
import { AlueAPIModel, fetchVATUByFairwayId, NavigointiLinjaAPIModel, RajoitusAlueAPIModel, VaylaAPIModel } from './vatu';

function mapAPIModelToFairway(apiModel: VaylaAPIModel): Fairway {
  const fairway: Fairway = {
    id: apiModel.jnro,
    name: {
      fi: apiModel.nimiFI || '',
      sv: apiModel.nimiSV || '',
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
  const lines = await fetchVATUByFairwayId<NavigointiLinjaAPIModel>(fairwayIds, 'navigointilinjat');
  log.debug('lines: %d', lines.length);
  const lineMap = new Map<number, NavigointiLinjaAPIModel[]>();
  for (const line of lines) {
    for (const lineFairway of line.vayla) {
      if (!lineMap.has(lineFairway.jnro)) {
        lineMap.set(lineFairway.jnro, []);
      }
      lineMap.get(lineFairway.jnro)?.push(line);
    }
  }
  return lineMap;
}

function mapNavigationLines(lines: NavigointiLinjaAPIModel[]) {
  return lines.map((apiLine) => {
    const line: NavigationLine = {
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
      geometry: apiLine.geometria,
      fairways: [],
    };
    line.fairways = apiLine.vayla?.map((apiFairway) => {
      return {
        fairwayId: apiFairway.jnro,
        status: apiFairway.status,
        line: apiFairway.linjaus,
      };
    });
    return line;
  });
}

async function getAreaMap(fairwayIds: number[]) {
  const areas = await fetchVATUByFairwayId<AlueAPIModel>(fairwayIds, 'vaylaalueet');
  log.debug('areas: %d', areas.length);
  const areaMap = new Map<number, AlueAPIModel[]>();
  for (const area of areas) {
    for (const areaFairway of area.vayla || []) {
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
      }) || [];
    if (apiArea.rajoitustyyppi) {
      area.types.push({ text: apiArea.rajoitustyyppi });
    }
    return area;
  });
}

async function getRestrictionAreaMap(fairwayIds: number[]) {
  const areas = await fetchVATUByFairwayId<RajoitusAlueAPIModel>(fairwayIds, 'rajoitusalueet');
  log.debug('restriction areas: %d', areas.length);
  const areaMap = new Map<number, RajoitusAlueAPIModel[]>();
  for (const area of areas) {
    for (const areaFairway of area.vayla || []) {
      if (!areaMap.has(areaFairway.jnro)) {
        areaMap.set(areaFairway.jnro, []);
      }
      areaMap.get(areaFairway.jnro)?.push(area);
    }
  }
  return areaMap;
}

export const handler: AppSyncResolverHandler<QueryFairwayCardArgs, Fairway[], FairwayCard> = async (
  event: AppSyncResolverEvent<QueryFairwayCardArgs, FairwayCard>
): Promise<Fairway[]> => {
  log.info(`fairwayCardFairways(${event.source.id})`);
  const fairwayMap = new Map<number, Fairway>();
  event.source.fairways.forEach((f) => {
    fairwayMap.set(f.id, f);
  });
  const fairwayIds = event.source.fairways.map((f) => f.id);
  log.debug(`fairwayIds: ${fairwayIds}`);
  const lineMap = await getNavigationLineMap(fairwayIds);
  const areaMap = await getAreaMap(fairwayIds);
  const restrictionAreaMap = await getRestrictionAreaMap(fairwayIds);
  const fairways = await fetchVATUByFairwayId<VaylaAPIModel>(fairwayIds, 'vaylat');
  return fairways.map((apiFairway) => {
    const fairway = fairwayMap.get(apiFairway.jnro);
    log.debug('Fairway: %o', apiFairway);
    return {
      ...mapAPIModelToFairway(apiFairway),
      ...fairway,
      navigationLines: mapNavigationLines(lineMap.get(apiFairway.jnro) || []),
      areas: mapAreas(areaMap.get(apiFairway.jnro) || []),
      restrictionAreas: mapRestrictionAreas(restrictionAreaMap.get(apiFairway.jnro) || []),
    };
  });
};
