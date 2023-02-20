import { AppSyncResolverEvent } from 'aws-lambda/trigger/appsync-resolver';
import { CurrentUser } from '../../../../graphql/generated';
import { validateJwtToken } from '../../api/login';
import { log } from '../../logger';

export const handler = async (event: AppSyncResolverEvent<void>): Promise<CurrentUser> => {
  log.info({ headers: event.request.headers }, `currentUser(${event.identity})`);
  const token = event.request.headers['x-iam-accesstoken'];
  const data = event.request.headers['x-iam-data'];
  const jwtToken = await validateJwtToken(token, data || '');
  log.debug('JwtToken: %s', jwtToken);
  return {
    name: jwtToken ? jwtToken['custom:etunimi'] + ' ' + jwtToken['custom:sukunimi'] : '????',
  };
};
