import { AppSyncResolverEvent } from 'aws-lambda/trigger/appsync-resolver';
import { Harbor } from '../../../../graphql/generated';
import HarborDBModel from '../../db/harborDBModel';
import { log } from '../../logger';

export const handler = async (event: AppSyncResolverEvent<void>): Promise<Harbor[]> => {
  log.info(`harbors(${event.identity})`);
  const harbors = await HarborDBModel.getAll();
  log.debug('%d harbor(s) found', harbors.length);
  return harbors;
};
