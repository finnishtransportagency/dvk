import { AppSyncResolverEvent, AppSyncResolverHandler } from 'aws-lambda';
import { Fairway, NavigationLine, QueryFairwayCardArgs } from '../../../../graphql/generated';
import { log } from '../../logger';
import { fetchVATUByFairwayId, NavigointiLinjaAPIModel } from './vatu';

export const handler: AppSyncResolverHandler<QueryFairwayCardArgs, NavigationLine[], Fairway> = async (
  event: AppSyncResolverEvent<QueryFairwayCardArgs, Fairway>
): Promise<NavigationLine[]> => {
  log.info(`navigationLines(${event.source.id})`);
  const lines = await fetchVATUByFairwayId<NavigointiLinjaAPIModel>(event.source.id, 'navigointilinjat');
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
};
