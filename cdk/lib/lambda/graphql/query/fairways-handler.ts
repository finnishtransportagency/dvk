import { AppSyncResolverEvent } from 'aws-lambda/trigger/appsync-resolver';
import { Fairway } from '../../../../graphql/generated';
import { log } from '../../logger';

export async function handleEvent(event: AppSyncResolverEvent<void>): Promise<Fairway[]> {
  log.info(`handleEvent(${JSON.stringify(event)})`);
  return [
    {
      id: 4927,
      nameFI: 'Vuosaari',
      nameSV: 'Nordsjöleden',
    },
    {
      id: 2345,
      nameFI: 'Uudenkaupungin väylä',
      nameSV: 'Farleden till Nystad',
    },
    {
      id: 10,
      nameFI: 'Kemin edusta',
      nameSV: 'Kemi angörin',
    },
  ];
}
