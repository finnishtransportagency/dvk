import { AppSyncResolverEvent, AppSyncResolverHandler } from 'aws-lambda/trigger/appsync-resolver';
import { Harbor, QueryHarborPreviewArgs, Status } from '../../../../graphql/generated';
import { auditLog as log } from '../../logger';
import { mapHarborDBModelToGraphqlType } from '../../db/modelMapper';
import { ADMIN_ROLE, getOptionalCurrentUser } from '../../api/login';
import HarborDBModel from '../../db/harborDBModel';

export const handler: AppSyncResolverHandler<QueryHarborPreviewArgs, Harbor | undefined> = async (
  event: AppSyncResolverEvent<QueryHarborPreviewArgs>
): Promise<Harbor | undefined> => {
  log.info(`harborPreview(${event.arguments.id})`);
  const user = await getOptionalCurrentUser(event);

  if (user?.roles.includes(ADMIN_ROLE)) {
    const dbModel = await HarborDBModel.get(event.arguments.id, event.arguments.version);

    if (dbModel?.status === Status.Draft || dbModel?.status === Status.Public) {
      return mapHarborDBModelToGraphqlType(dbModel, user);
    }
  } else {
    log.error(`User missing required role ${ADMIN_ROLE}`);
  }

  return undefined;
};
