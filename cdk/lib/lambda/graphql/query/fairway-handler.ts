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
    draft1: apiModel.kulkuSyvyys1,
    draft2: apiModel.kulkuSyvyys2,
    draft3: apiModel.kulkuSyvyys3,
    length: apiModel.pituus,
  };
  return fairway;
};
