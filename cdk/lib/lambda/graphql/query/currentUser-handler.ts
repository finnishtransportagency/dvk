import { AppSyncResolverEvent } from 'aws-lambda/trigger/appsync-resolver';
import { CurrentUser } from '../../../../graphql/generated';
import { getCurrentUser } from '../../api/login';
import { log } from '../../logger';

export const handler = async (event: AppSyncResolverEvent<void>): Promise<CurrentUser> => {
  const user = await getCurrentUser(event);
  log.debug(`currentUser(${user.uid})`);
  return {
    uid: user.uid,
    name: `${user.firstName} ${user.lastName}`,
    roles: user.roles,
  };
};
