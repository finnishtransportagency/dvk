import { AppSyncResolverEvent, AppSyncResolverHandler } from 'aws-lambda';
import axios from 'axios';
import { Area, Fairway, QueryFairwayCardArgs } from '../../../../graphql/generated';
import { getVatuHeaders, getVatuUrl } from '../../environment';
import { log } from '../../logger';

export type AlueVaylaAPIModel = {
  jnro: number;
  status: number;
  linjaus: number;
  mitoitusNopeus?: number;
  mitoitusNopeus2?: number;
};
export type AlueAPIModel = {
  id: number;
  nimi?: string;
  mitoitusSyvays?: number;
  harausSyvyys?: number;
  vertaustaso?: string;
  n2000MitoitusSyvays?: number;
  n2000HarausSyvyys?: number;
  n2000Vertaustaso?: string;
  suunta?: number;
  diaariNumero?: string;
  vahvistusPaivamaara?: string;
  omistaja?: string;
  lisatieto?: string;
  vayla?: AlueVaylaAPIModel[];
  tyyppiKoodi?: string;
  tyyppi?: string;
  merkintalajiKoodi?: number;
  merkintalaji?: string;
  liikennointiStatusKoodi?: number;
  liikennointiStatus?: string;
  liikennointiTyyppiKoodi?: number;
  liikenteenTyyppi?: string;
  liikennointiSuuntaKoodi?: number;
  liikennointiSuunta?: string;
  geometria: object;
};

export const handler: AppSyncResolverHandler<QueryFairwayCardArgs, Area[], Fairway> = async (
  event: AppSyncResolverEvent<QueryFairwayCardArgs, Fairway>
): Promise<Area[]> => {
  log.info(`areas(${event.source.id})`);
  const response = await axios.get(`${await getVatuUrl()}/vaylaalueet?jnro=${event.source.id}`, {
    headers: await getVatuHeaders(),
  });
  const areas = response.data as AlueAPIModel[];
  log.debug('areas: %d', areas.length);
  return areas.map((apiArea) => {
    const area: Area = {
      id: apiArea.id,
      name: apiArea.nimi,
      depth: apiArea.mitoitusSyvays,
      draft: apiArea.harausSyvyys,
      referenceLevel: apiArea.vertaustaso,
      n2000depth: apiArea.n2000MitoitusSyvays,
      n2000draft: apiArea.n2000HarausSyvyys,
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
