import { AppSyncResolverEvent } from 'aws-lambda/trigger/appsync-resolver';
import { Mareograph } from '../../../../graphql/generated';
import { log } from '../../logger';
import { fetchMareoGraphs } from '../../api/weather';

export const handler = async (event: AppSyncResolverEvent<void>): Promise<Mareograph[]> => {
  log.info(`mareographs(${event.identity})`);
  const mareographs = await fetchMareoGraphs();
  log.debug('%d mareographs found', mareographs.length);
  return mareographs;
};
