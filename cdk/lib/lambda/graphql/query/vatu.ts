import { ALBEvent } from 'aws-lambda';
import { fetchVATUByApi } from '../../api/axios';
import { VaylaFeature, VaylaGeojsonFeature } from '../../api/apiModels';

export async function fetchVATUByFairwayId<T extends VaylaFeature | VaylaGeojsonFeature>(fairwayId: number | number[], api: string) {
  const ids = Array.isArray(fairwayId) ? fairwayId.join(',') : fairwayId.toString();
  return fetchVATUByApi<T>(api, { jnro: ids });
}

export async function fetchVATUByFairwayClass<T extends VaylaFeature | VaylaGeojsonFeature>(api: string, event: ALBEvent) {
  const fairwayClass = event.multiValueQueryStringParameters?.vaylaluokka?.join(',') ?? '1';
  return fetchVATUByApi<T>(api, { vaylaluokka: fairwayClass });
}
