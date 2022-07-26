import { AppSyncResolverEvent } from 'aws-lambda/trigger/appsync-resolver';
import { Fairway } from '../../../../graphql/generated';
import { log } from '../../logger';

export const handler = async (event: AppSyncResolverEvent<void>): Promise<Fairway[]> => {
  log.info(`fairways(${event.identity})`);
  return [
    {
      id: 4927,
      name: {
        fi: 'Vuosaari',
        sv: 'Nordsjöleden',
        en: '',
      },
    },
    {
      id: 2345,
      name: {
        fi: 'Uudenkaupungin väylä',
        sv: 'Farleden till Nystad',
        en: '',
      },
    },
    {
      id: 10,
      name: {
        fi: 'Kemin edusta',
        sv: 'Kemi angörin',
        en: '',
      },
    },
  ];
};
