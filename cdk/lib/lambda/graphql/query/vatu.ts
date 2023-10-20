import { ALBEvent } from 'aws-lambda';
import { fetchVATUByApi } from '../../api/axios';
import { GeometryModel, VaylaAPIModel } from '../../api/apiModels';

export async function fetchVATUByFairwayId<T extends GeometryModel | VaylaAPIModel>(fairwayId: number | number[], api: string) {
  const ids = Array.isArray(fairwayId) ? fairwayId.join(',') : fairwayId.toString();
  return fetchVATUByApi<T>(api, { jnro: ids });
}

export async function fetchVATUByFairwayClass<T extends GeometryModel | VaylaAPIModel>(api: string, event: ALBEvent) {
  const fairwayClass = event.multiValueQueryStringParameters?.vaylaluokka?.join(',') ?? '1';
  return fetchVATUByApi<T>(api, { vaylaluokka: fairwayClass });
}
