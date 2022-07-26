import { AppSyncResolverEvent, AppSyncResolverHandler } from 'aws-lambda';
import { Fairway, NavigationLine, QueryFairwayArgs } from '../../../../graphql/generated';
import { log } from '../../logger';

export const handler: AppSyncResolverHandler<QueryFairwayArgs, NavigationLine[], Fairway> = async (
  event: AppSyncResolverEvent<QueryFairwayArgs>
): Promise<NavigationLine[]> => {
  log.info(`navigationLines(${event.source?.id})`);
  return [{ id: 1, depth: 129.12, geometry: 'geojson' }];
};
