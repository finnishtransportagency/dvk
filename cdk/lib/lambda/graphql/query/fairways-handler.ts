import { AppSyncResolverEvent } from 'aws-lambda/trigger/appsync-resolver';
import { Fairway } from '../../../../graphql/generated';
import { FairwayService } from '../../api/fairwayService';
import FairwayDBModel from '../../db/fairwayModel';
import { log } from '../../logger';

const fairwayService = new FairwayService();

export const handler = async (event: AppSyncResolverEvent<void>): Promise<Fairway[]> => {
  log.info(`fairways(${event.identity})`);
  const fairways = await FairwayDBModel.getAll();
  log.debug('fairways: %o', fairways);
  const dbModelMap = new Map<number, FairwayDBModel>();
  fairways.forEach((fairway) => {
    dbModelMap.set(fairway.id, fairway);
  });
  return fairwayService.getFairways().map((apiModel) => {
    const fairway: Fairway = {
      id: apiModel.id,
      name: {
        fi: apiModel.nimiFI,
        sv: apiModel.nimiSV || '',
        en: dbModelMap.get(apiModel.id)?.name || '',
      },
      draft1: apiModel.kulkuSyvyys1,
      draft2: apiModel.kulkuSyvyys2,
      draft3: apiModel.kulkuSyvyys3,
      length: apiModel.pituus,
    };
    return fairway;
  });
};
