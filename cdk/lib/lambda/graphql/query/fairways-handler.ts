import { AppSyncResolverEvent } from 'aws-lambda/trigger/appsync-resolver';
import { Fairway } from '../../../../graphql/generated';
import FairwayModel from '../../db/fairwayModel';
import { log } from '../../logger';

export const handler = async (event: AppSyncResolverEvent<void>): Promise<Fairway[]> => {
  log.info(`fairways(${event.identity})`);
  const fairways = await FairwayModel.getAll();
  const modelMap = new Map<number, FairwayModel>();
  log.debug('fairways: %o', fairways);
  fairways.forEach((fairway) => {
    modelMap.set(fairway.id, fairway);
  });
  return [
    {
      id: 4927,
      name: {
        fi: 'Vuosaari',
        sv: 'Nordsjöleden',
        en: modelMap.get(4927)?.name || '',
      },
    },
    {
      id: 2345,
      name: {
        fi: 'Uudenkaupungin väylä',
        sv: 'Farleden till Nystad',
        en: modelMap.get(2345)?.name || '',
      },
    },
    {
      id: 10,
      name: {
        fi: 'Kemin edusta',
        sv: 'Kemi angörin',
        en: modelMap.get(10)?.name || '',
      },
    },
  ];
};
