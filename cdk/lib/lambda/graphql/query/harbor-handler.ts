import { AppSyncResolverEvent, AppSyncResolverHandler } from 'aws-lambda/trigger/appsync-resolver';
import { Harbor, QueryHarborArgs } from '../../../../graphql/generated';
import { log } from '../../logger';
import HarborDBModel from '../../db/harborDBModel';

export const handler: AppSyncResolverHandler<QueryHarborArgs, Harbor | undefined> = async (
  event: AppSyncResolverEvent<QueryHarborArgs>
): Promise<Harbor | undefined> => {
  log.info(`harbor(${event.arguments.id})`);
  return HarborDBModel.get(event.arguments.id);
};
