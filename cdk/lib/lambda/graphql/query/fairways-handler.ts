import { AppSyncResolverEvent } from 'aws-lambda/trigger/appsync-resolver';
import { Boardline, Fairway, ProhibitionArea, TurningCircle } from '../../../../graphql/generated';
import { log } from '../../logger';
import { mapAPIModelToFairway } from './fairwayCardFairways-handler';
import { fetchVATUByFairwayId } from './vatu';
import { cacheResponse, getFromCache } from '../cache';
import { fetchVATUByApi } from '../../api/axios';
import { VaylaFeature, VaylaFeatureCollection, VaylaGeojsonFeature } from '../../api/apiModels';
import { fetchProhibitionAreas } from '../../api/traficom';

function mapIdModels(models: APIFeature[]) {
  return models.map((model) => {
    return {
      id: model.properties.id as number,
    };
  });
}

function mapBoardLines(lines: APIFeature[]): Boardline[] {
  return lines.map((line) => {
    return {
      id: line.properties.taululinjaId as number,
    };
  });
}

function mapTurningCircles(circles: APIFeature[]): TurningCircle[] {
  return circles.map((circle) => {
    return {
      id: circle.properties.kaantoympyraID as number,
    };
  });
}

interface APIFeature extends VaylaGeojsonFeature {
  properties: {
    vayla: [{ jnro: number }];
    kaantoympyraID?: number;
    taululinjaId?: number;
    id?: number;
    tyyppiKoodi?: number;
  };
}

interface APIFeatureCollection {
  features: APIFeature[];
}

async function getModelMap(fairwayIds: number[], api: string) {
  let i: number | undefined = 0;
  let models = (await fetchVATUByFairwayId<VaylaFeature>(fairwayIds, api)).data as APIFeatureCollection;
  if (api === 'vaylaalueet') {
    // Filter specialarea15, fetched separately from Traficom)
    models.features = models.features.filter((m) => m.properties.tyyppiKoodi !== 15);
  }
  log.debug('models: %d', models.features.length);
  const modelMap = new Map<number, APIFeature[]>();
  for (const model of models.features) {
    for (const fairway of model.properties.vayla ?? []) {
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
    const fairways = (await fetchVATUByApi<VaylaFeature>('vaylat', { vaylaluokka: '1,2' })).data as VaylaFeatureCollection;
    log.debug('%d fairway(s) found', fairways.features.length);
    const fairwayIds = fairways.features.map((f) => f.properties.jnro);
    const lines = await getModelMap(fairwayIds, 'navigointilinjat');
    const areas = await getModelMap(fairwayIds, 'vaylaalueet');
    const restrictionAreas = await getModelMap(fairwayIds, 'rajoitusalueet');
    const prohibitionAreas = await getProhibitionAreaMap();
    const circles = await getModelMap(fairwayIds, 'kaantoympyrat');
    const boardLines = await getModelMap(fairwayIds, 'taululinjat');
    const response = fairways.features.map((apiFairway) => {
      return {
        ...mapAPIModelToFairway(apiFairway),
        navigationLines: mapIdModels(lines.get(apiFairway.properties.jnro) ?? []),
        areas: mapIdModels(areas.get(apiFairway.properties.jnro) ?? []),
        restrictionAreas: mapIdModels(restrictionAreas.get(apiFairway.properties.jnro) ?? []),
        prohibitionAreas: prohibitionAreas.get(apiFairway.properties.jnro) ?? [],
        boardLines: mapBoardLines(boardLines.get(apiFairway.properties.jnro) ?? []),
        turningCircles: mapTurningCircles(circles.get(apiFairway.properties.jnro) ?? []),
      };
    });
    await cacheResponse(key, response);
    return response;
  }
};
