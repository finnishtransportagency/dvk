import { AppSyncResolverEvent } from 'aws-lambda/trigger/appsync-resolver';
import { Boardline, Fairway, ProhibitionArea, TurningCircle } from '../../../../graphql/generated';
import { log } from '../../logger';
import { mapAPIModelToFairway } from './fairwayCardFairways-handler';
import { fetchVATUByFairwayId } from './vatu';
import { cacheResponse, getFromCache } from '../cache';
import { fetchVATUByApi } from '../../api/axios';
import { GeometryModel, VaylaAPIModel } from '../../api/apiModels';
import { fetchProhibitionAreas } from '../../api/traficom';

function mapIdModels(models: APIModel[]) {
  return models.map((model) => {
    return {
      id: model.id as number,
    };
  });
}

function mapBoardLines(lines: APIModel[]): Boardline[] {
  return lines.map((line) => {
    return {
      id: line.taululinjaId as number,
    };
  });
}

function mapTurningCircles(circles: APIModel[]): TurningCircle[] {
  return circles.map((circle) => {
    return {
      id: circle.kaantoympyraID as number,
    };
  });
}

interface APIModel extends GeometryModel {
  vayla: [{ jnro: number }];
  kaantoympyraID?: number;
  taululinjaId?: number;
  id?: number;
  tyyppiKoodi?: number;
}

async function getModelMap(fairwayIds: number[], api: string) {
  let models = (await fetchVATUByFairwayId<APIModel>(fairwayIds, api)).data as APIModel[];
  if (api === 'vaylaalueet') {
    // Filter specialarea15, fetched separately from Traficom)
    models = models.filter((m) => m.tyyppiKoodi !== 15);
  }
  log.debug('models: %d', models.length);
  const modelMap = new Map<number, APIModel[]>();
  for (const model of models) {
    for (const fairway of model.vayla ?? []) {
      if (!modelMap.has(fairway.jnro)) {
        modelMap.set(fairway.jnro, []);
      }
      modelMap.get(fairway.jnro)?.push(model);
    }
  }
  return modelMap;
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
    areaMap.get(fairway.fairwayId)?.push({ id: area.id as number, typeCode: area.properties?.typeCode, fairway: { fairwayId: fairway.fairwayId } });
  }
  return areaMap;
}

export const handler = async (event: AppSyncResolverEvent<void>): Promise<Fairway[]> => {
  log.info(`fairways(${event.identity})`);
  const key = 'fairways';
  const cacheResponseData = await getFromCache(key);
  if (!cacheResponseData.expired && cacheResponseData.data) {
    log.debug('returning fairways from cache');
    return JSON.parse(cacheResponseData.data);
  } else {
    const fairways = (await fetchVATUByApi<VaylaAPIModel>('vaylat', { vaylaluokka: '1,2' })).data as VaylaAPIModel[];
    log.debug('%d fairway(s) found', fairways.length);
    const fairwayIds = fairways.map((f) => f.jnro);
    const lines = await getModelMap(fairwayIds, 'navigointilinjat');
    const areas = await getModelMap(fairwayIds, 'vaylaalueet');
    const restrictionAreas = await getModelMap(fairwayIds, 'rajoitusalueet');
    const prohibitionAreas = await getProhibitionAreaMap();
    const circles = await getModelMap(fairwayIds, 'kaantoympyrat');
    const boardLines = await getModelMap(fairwayIds, 'taululinjat');
    const response = fairways.map((apiFairway) => {
      return {
        ...mapAPIModelToFairway(apiFairway),
        navigationLines: mapIdModels(lines.get(apiFairway.jnro) ?? []),
        areas: mapIdModels(areas.get(apiFairway.jnro) ?? []),
        restrictionAreas: mapIdModels(restrictionAreas.get(apiFairway.jnro) ?? []),
        prohibitionAreas: prohibitionAreas.get(apiFairway.jnro) ?? [],
        boardLines: mapBoardLines(boardLines.get(apiFairway.jnro) ?? []),
        turningCircles: mapTurningCircles(circles.get(apiFairway.jnro) ?? []),
      };
    });
    await cacheResponse(key, response);
    return response;
  }
};
