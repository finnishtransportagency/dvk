import { AppSyncResolverEvent, AppSyncResolverHandler } from 'aws-lambda/trigger/appsync-resolver';
import { Fairway, QueryFairwayArgs } from '../../../../graphql/generated';
import { log } from '../../logger';
import FairwayDBModel from '../../db/fairwayModel';
import { FairwayService } from '../../api/fairwayService';

const fairwayService = new FairwayService();

export const handler: AppSyncResolverHandler<QueryFairwayArgs, Fairway> = async (event: AppSyncResolverEvent<QueryFairwayArgs>): Promise<Fairway> => {
  log.info(`fairway(${event.arguments.id})`);
  const dbModel = await FairwayDBModel.get(event.arguments.id);
  const apiModel = fairwayService.getFairway(event.arguments.id);
  const fairway: Fairway = {
    id: event.arguments.id,
    name: {
      fi: apiModel.nimiFI,
      sv: apiModel.nimiSV || '',
      en: dbModel?.name || '',
    },
    length: 230,
    depth1: 15.5,
    depth2: 15,
    depth3: 14,
  };
  return fairway;
};
