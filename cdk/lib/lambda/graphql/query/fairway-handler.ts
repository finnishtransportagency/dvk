import { AppSyncResolverEvent, AppSyncResolverHandler } from 'aws-lambda/trigger/appsync-resolver';
import { Fairway, QueryFairwayArgs } from '../../../../graphql/generated';
import { log } from '../../logger';

export const handler: AppSyncResolverHandler<QueryFairwayArgs, Fairway> = async (event: AppSyncResolverEvent<QueryFairwayArgs>): Promise<Fairway> => {
  log.info(`fairway(${event.arguments.id})`);
  return {
    id: event.arguments.id,
    nameFI: 'Vuosaari',
    nameSV: 'Nordsjöleden',
    length: 230,
    depth1: 15.5,
    depth2: 15,
    depth3: 14,
  };
};
