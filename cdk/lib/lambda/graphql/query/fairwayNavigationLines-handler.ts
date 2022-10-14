import { AppSyncResolverEvent, AppSyncResolverHandler } from 'aws-lambda';
import axios from 'axios';
import { Fairway, NavigationLine, QueryFairwayCardArgs } from '../../../../graphql/generated';
import { getVatuHeaders, getVatuUrl } from '../../environment';
import { log } from '../../logger';

export type NavigointiLinjaAPIModel = {
  id: number;
  mitoitusSyvays?: number;
  harausSyvyys?: number;
  vertaustaso?: string;
  n2000MitoitusSyvays?: number;
  n2000HarausSyvyys?: number;
  n2000Vertaustaso?: string;
  tosisuunta?: number;
  pituus?: number;
  diaariNumero?: string;
  vahvistusPaivamaara?: string;
  omistaja?: string;
  lisatieto?: string;
  tyyppiKoodi?: string;
  tyyppi?: string;
  geometria: object;
  vayla: NavigointiLinjaVaylaAPIModel[];
};

type NavigointiLinjaVaylaAPIModel = {
  jnro: number;
  status?: number;
  linjaus?: number;
};

export const handler: AppSyncResolverHandler<QueryFairwayCardArgs, NavigationLine[], Fairway> = async (
  event: AppSyncResolverEvent<QueryFairwayCardArgs, Fairway>
): Promise<NavigationLine[]> => {
  log.info(`navigationLines(${event.source.id})`);
  const response = await axios.get(`${await getVatuUrl()}/navigointilinjat?jnro=${event.source.id}`, {
    headers: await getVatuHeaders(),
  });
  const lines = response.data as NavigointiLinjaAPIModel[];
  log.debug('lines: %d', lines.length);
  return lines.map((apiLine) => {
    const line: NavigationLine = {
      id: apiLine.id,
      depth: apiLine.mitoitusSyvays,
      draft: apiLine.harausSyvyys,
      referenceLevel: apiLine.vertaustaso,
      n2000depth: apiLine.n2000MitoitusSyvays,
      n2000draft: apiLine.n2000HarausSyvyys,
      n2000ReferenceLevel: apiLine.n2000Vertaustaso,
      direction: apiLine.tosisuunta,
      length: apiLine.pituus,
      additionalInformation: apiLine.lisatieto,
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
};
