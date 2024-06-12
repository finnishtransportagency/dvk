import { AppSyncResolverEvent, AppSyncResolverHandler } from 'aws-lambda/trigger/appsync-resolver';
import { Harbor, QueryHarborLatestArgs } from '../../../../graphql/generated';
import { log } from '../../logger';
import HarborDBModel from '../../db/harborDBModel';
import { mapHarborDBModelToGraphqlType } from '../../db/modelMapper';
import { getOptionalCurrentUser } from '../../api/login';

export const handler: AppSyncResolverHandler<QueryHarborLatestArgs, Harbor | undefined> = async (
  event: AppSyncResolverEvent<QueryHarborLatestArgs>
): Promise<Harbor | undefined> => {
  log.info(`harbor(${event.arguments.id})`);
  const user = await getOptionalCurrentUser(event);
  const harbor = await HarborDBModel.getLatest(event.arguments.id);
  return harbor ? mapHarborDBModelToGraphqlType(harbor, user) : undefined;
};