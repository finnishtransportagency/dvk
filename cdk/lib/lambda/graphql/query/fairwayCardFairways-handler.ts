import { AppSyncResolverEvent, AppSyncResolverHandler } from 'aws-lambda';
import { Fairway, FairwayCard, QueryFairwayCardArgs } from '../../../../graphql/generated';
import { log } from '../../logger';
import axios from 'axios';
import { getVatuPassword, getVatuUrl, getVatuUsername } from '../../environment';

type MitoitusAlusAPIModel = {
  alustyyppi: string;
  pituus: number;
  leveys: number;
  syvays: number;
  koko?: number;
  runkoTaytelaisyysKerroin?: number;
};

type LuokitusAPIModel = {
  luokitusTyyppi: string;
  vaylaluokka: string;
};

type VaylaAPIModel = {
  jnro: number;
  nimiFI: string;
  nimiSV?: string;
  vaylaLajiFI?: string;
  vaylaLajiSV?: string;
  valaistusFI?: string;
  valaistusSV?: string;
  omistaja?: string;
  merialueFI?: string;
  merialueSV?: string;
  alunSeloste?: string;
  paatepisteenSeloste?: string;
  normaaliKaantosade?: number;
  minimiKaantosade?: number;
  normaaliLeveys?: number;
  minimiLeveys?: number;
  varavesi?: string;
  lisatieto?: string;
  mareografi?: string;
  mitoitusalus?: MitoitusAlusAPIModel[];
  luokitus?: LuokitusAPIModel[];
};

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
    type: {
      fi: apiModel.vaylaLajiFI,
      sv: apiModel.vaylaLajiSV,
    },
    area: {
      fi: apiModel.merialueFI,
      sv: apiModel.merialueSV,
    },
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
      fairwayClass: classificationModel.vaylaluokka,
    };
  });
  return fairway;
}

export const handler: AppSyncResolverHandler<QueryFairwayCardArgs, Fairway[], FairwayCard> = async (
  event: AppSyncResolverEvent<QueryFairwayCardArgs, FairwayCard>
): Promise<Fairway[]> => {
  log.info(`fairwayCard(${event.source.id})`);
  const fairwayMap = new Map<number, Fairway>();
  event.source.fairways.forEach((f) => {
    fairwayMap.set(f.id, f);
  });
  const fairwayIds = event.source.fairways.map((f) => f.id);
  log.debug(`fairwayIds: ${fairwayIds}`);
  const response = await axios.get(`${getVatuUrl()}/vaylat?jnro=${fairwayIds.join(',')}`, {
    headers: {
      Authorization: 'Basic ' + Buffer.from(`${getVatuUsername()}:${getVatuPassword()}`).toString('base64'),
      'Content-type': 'application/json',
    },
  });
  for (const model of response.data as VaylaAPIModel[]) {
    log.debug('Fairway: %o', model);
  }
  const fairways = response.data as VaylaAPIModel[];
  return fairways.map((apiFairway) => {
    const fairway = fairwayMap.get(apiFairway.jnro);
    log.debug('fairway: %o', fairway);
    return {
      ...mapAPIModelToFairway(apiFairway),
      ...fairway,
    };
  });
};
