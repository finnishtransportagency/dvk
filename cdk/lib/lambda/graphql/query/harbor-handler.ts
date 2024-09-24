import { AppSyncResolverEvent, AppSyncResolverHandler } from 'aws-lambda/trigger/appsync-resolver';
import { Harbor, QueryHarborArgs, Status } from '../../../../graphql/generated';
import { log } from '../../logger';
import HarborDBModel from '../../db/harborDBModel';
import { mapHarborDBModelToGraphqlType } from '../../db/modelMapper';
import { ADMIN_ROLE, getOptionalCurrentUser } from '../../api/login';

export const handler: AppSyncResolverHandler<QueryHarborArgs, Harbor | undefined> = async (
  event: AppSyncResolverEvent<QueryHarborArgs>
): Promise<Harbor | undefined> => {
  const { id, version, status } = event.arguments;
  log.info(`harbor(${id})`);

  const user = await getOptionalCurrentUser(event);
  let harbor;

  if (!version && status?.every((s) => s === Status.Public)) {
    // Get the latest (only) public harbor
    harbor = await HarborDBModel.getPublic(id);
  } else if (user?.roles.includes(ADMIN_ROLE)) {
    // Only public harbors allowed without admin role
    if (version) {
      harbor = await HarborDBModel.getVersion(id, version);
    } else {
      harbor = await HarborDBModel.getLatest(id);
    }
  } else {
    log.error(`User missing required role ${ADMIN_ROLE}`);
  }

  return harbor ? mapHarborDBModelToGraphqlType(harbor, user) : undefined;
};
