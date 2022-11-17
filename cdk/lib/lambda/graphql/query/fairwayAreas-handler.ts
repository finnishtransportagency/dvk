import { AppSyncResolverEvent, AppSyncResolverHandler } from 'aws-lambda';
import { Area, Fairway, QueryFairwayCardArgs } from '../../../../graphql/generated';
import { log } from '../../logger';
import { AlueAPIModel, fetchVATUByFairwayId } from './vatu';

export const handler: AppSyncResolverHandler<QueryFairwayCardArgs, Area[], Fairway> = async (
  event: AppSyncResolverEvent<QueryFairwayCardArgs, Fairway>
): Promise<Area[]> => {
  log.info(`areas(${event.source.id})`);
  const areas = await fetchVATUByFairwayId<AlueAPIModel>(event.source.id, 'vaylaalueet');
  log.debug('areas: %d', areas.length);
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
      };
    });
    return area;
  });
};
