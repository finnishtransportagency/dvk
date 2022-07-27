import { AppSyncResolverEvent, AppSyncResolverHandler } from 'aws-lambda/trigger/appsync-resolver';
import { Fairway, QueryFairwayArgs } from '../../../../graphql/generated';
import { log } from '../../logger';
import FairwayModel from '../../db/fairwayModel';

export const handler: AppSyncResolverHandler<QueryFairwayArgs, Fairway> = async (event: AppSyncResolverEvent<QueryFairwayArgs>): Promise<Fairway> => {
  log.info(`fairway(${event.arguments.id})`);
  const fairway = await FairwayModel.get(event.arguments.id);
  return {
    id: event.arguments.id,
    name: {
      fi: 'Vuosaari',
      sv: 'Nordsjöleden',
      en: fairway?.name || '',
    },
    length: 230,
    depth1: 15.5,
    depth2: 15,
    depth3: 14,
  };
};
