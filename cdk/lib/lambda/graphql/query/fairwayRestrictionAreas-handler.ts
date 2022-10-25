import { AppSyncResolverEvent, AppSyncResolverHandler } from 'aws-lambda';
import { Fairway, QueryFairwayCardArgs, RestrictionArea } from '../../../../graphql/generated';
import { log } from '../../logger';
import { fetchVATUByFairwayId, RajoitusAlueAPIModel } from './vatu';

export const handler: AppSyncResolverHandler<QueryFairwayCardArgs, RestrictionArea[], Fairway> = async (
  event: AppSyncResolverEvent<QueryFairwayCardArgs, Fairway>
): Promise<RestrictionArea[]> => {
  log.info(`restrictionAreas(${event.source.id})`);
  const areas = await fetchVATUByFairwayId<RajoitusAlueAPIModel>(event.source.id, 'rajoitusalueet');
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
