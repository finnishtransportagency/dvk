import { AppSyncResolverEvent } from 'aws-lambda/trigger/appsync-resolver';
import { Fairway } from '../../graphql/generated';
import { log } from './logger';

export type LambdaResult = {
  data: {
    result: Fairway[];
  };
};

export type AppSyncEventArguments = unknown;

export async function handleEvent(event: AppSyncResolverEvent<AppSyncEventArguments>): Promise<LambdaResult> {
  log.info(`handleEvent(${event.info.fieldName})`);
  return {
    data: {
      result: [
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
      ],
    },
  };
}
