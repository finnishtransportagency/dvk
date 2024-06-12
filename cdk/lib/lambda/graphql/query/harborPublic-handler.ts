import { AppSyncResolverEvent, AppSyncResolverHandler } from 'aws-lambda/trigger/appsync-resolver';
import { Harbor, QueryHarborPublicArgs } from '../../../../graphql/generated';
import { log } from '../../logger';
import HarborDBModel from '../../db/harborDBModel';
import { mapHarborDBModelToGraphqlType } from '../../db/modelMapper';
import { getOptionalCurrentUser } from '../../api/login';

export const handler: AppSyncResolverHandler<QueryHarborPublicArgs, Harbor | undefined> = async (
  event: AppSyncResolverEvent<QueryHarborPublicArgs>
): Promise<Harbor | undefined> => {
  log.info(`harbor(${event.arguments.id})`);
  const user = await getOptionalCurrentUser(event);
  const harbor = await HarborDBModel.getPublic(event.arguments.id);
  return harbor ? mapHarborDBModelToGraphqlType(harbor, user) : undefined;
};