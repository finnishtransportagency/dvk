import { AppSyncResolverEvent } from 'aws-lambda/trigger/appsync-resolver';
import { Boardline, Fairway, TurningCircle } from '../../../../graphql/generated';
import { log } from '../../logger';
import { mapAPIModelToFairway } from './fairwayCardFairways-handler';
import { GeometryModel, VaylaAPIModel, fetchVATUByApi, fetchVATUByFairwayId } from './vatu';
import { cacheResponse, getFromCache } from '../cache';

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
}

async function getModelMap(fairwayIds: number[], api: string) {
  const models = await fetchVATUByFairwayId<APIModel>(fairwayIds, api);
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

export const handler = async (event: AppSyncResolverEvent<void>): Promise<Fairway[]> => {
  log.info(`fairways(${event.identity})`);
  const key = 'fairways';
  const cacheResponseData = await getFromCache(key);
  if (!cacheResponseData.expired && cacheResponseData.data) {
    log.debug('returning fairways from cache');
    return JSON.parse(cacheResponseData.data);
  } else {
    const fairways = await fetchVATUByApi<VaylaAPIModel>('vaylat', { vaylaluokka: '1,2' });
    log.debug('%d fairway(s) found', fairways.length);
    const fairwayIds = fairways.map((f) => f.jnro);
    const lines = await getModelMap(fairwayIds, 'navigointilinjat');
    const areas = await getModelMap(fairwayIds, 'vaylaalueet');
    const restrictionAreas = await getModelMap(fairwayIds, 'rajoitusalueet');
    const circles = await getModelMap(fairwayIds, 'kaantoympyrat');
    const boardLines = await getModelMap(fairwayIds, 'taululinjat');
    const response = fairways.map((apiFairway) => {
      return {
        ...mapAPIModelToFairway(apiFairway),
        navigationLines: mapIdModels(lines.get(apiFairway.jnro) ?? []),
        areas: mapIdModels(areas.get(apiFairway.jnro) ?? []),
        restrictionAreas: mapIdModels(restrictionAreas.get(apiFairway.jnro) ?? []),
        boardLines: mapBoardLines(boardLines.get(apiFairway.jnro) ?? []),
        turningCircles: mapTurningCircles(circles.get(apiFairway.jnro) ?? []),
      };
    });
    await cacheResponse(key, response);
    return response;
  }
};
