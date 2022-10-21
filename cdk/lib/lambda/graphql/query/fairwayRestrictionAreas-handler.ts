import { AppSyncResolverEvent, AppSyncResolverHandler } from 'aws-lambda';
import axios from 'axios';
import { Fairway, QueryFairwayCardArgs, RestrictionArea } from '../../../../graphql/generated';
import { getVatuHeaders, getVatuUrl } from '../../environment';
import { log } from '../../logger';

export type RajoitusAlueAPIModel = {
  id: number;
  rajoitustyyppi?: string;
  rajoitustyypit?: RajoitustyyppiAPIModel[];
  suuruus?: number;
  esittaja?: string;
  diaariNumero?: string;
  vahvistusPaivamaara?: string;
  muutosPaivamaara?: string;
  alkuPaivamaara?: string;
  loppuPaivamaara?: string;
  paatosTila?: string;
  tietolahde?: string;
  sijainti?: string;
  kunta?: string;
  poikkeus?: string;
  geometria: object;
  vayla?: RajoitusVaylaAPIModel[];
};

export type RajoitustyyppiAPIModel = {
  koodi?: string;
  rajoitustyyppi?: string;
};

export type RajoitusVaylaAPIModel = {
  jnro: number;
};

export const handler: AppSyncResolverHandler<QueryFairwayCardArgs, RestrictionArea[], Fairway> = async (
  event: AppSyncResolverEvent<QueryFairwayCardArgs, Fairway>
): Promise<RestrictionArea[]> => {
  log.info(`restrictionAreas(${event.source.id})`);
  const response = await axios.get(`${await getVatuUrl()}/rajoitusalueet?jnro=${event.source.id}`, {
    headers: await getVatuHeaders(),
  });
  const areas = response.data as RajoitusAlueAPIModel[];
  log.debug('areas: %d', areas.length);
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
};
