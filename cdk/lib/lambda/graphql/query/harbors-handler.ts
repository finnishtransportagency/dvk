import { AppSyncResolverEvent } from 'aws-lambda/trigger/appsync-resolver';
import { Harbor } from '../../../../graphql/generated';
import { getOptionalCurrentUser } from '../../api/login';
import HarborDBModel from '../../db/harborDBModel';
import { mapHarborDBModelToGraphqlType } from '../../db/modelMapper';
import { log } from '../../logger';

export const handler = async (event: AppSyncResolverEvent<void>): Promise<Harbor[]> => {
  log.info(`harbors(${event.identity})`);
  const harbors = await HarborDBModel.getAllLatest();
  const user = await getOptionalCurrentUser(event);
  log.debug('%d harbor(s) found', harbors.length);
  return harbors.map((harbor) => mapHarborDBModelToGraphqlType(harbor, user));
};
