import { AppSyncResolverEvent, AppSyncResolverHandler } from 'aws-lambda/trigger/appsync-resolver';
import { Harbor, QueryHarborArgs } from '../../../../graphql/generated';
import { log } from '../../logger';
import HarborDBModel from '../../db/harborDBModel';
import { mapHarborDBModelToGraphqlType } from '../../db/modelMapper';
import { getOptionalCurrentUser } from '../../api/login';

export const handler: AppSyncResolverHandler<QueryHarborArgs, Harbor | undefined> = async (
  event: AppSyncResolverEvent<QueryHarborArgs>
): Promise<Harbor | undefined> => {
  log.info(`harbor(${event.arguments.id})`);
  const user = await getOptionalCurrentUser(event);
  const harbor = await HarborDBModel.get(event.arguments.id, event.arguments.version);
  return harbor ? mapHarborDBModelToGraphqlType(harbor, user) : undefined;
};