import { AppSyncResolverEvent, AppSyncResolverHandler } from 'aws-lambda/trigger/appsync-resolver';
import { Fairway, QueryFairwayArgs } from '../../../../graphql/generated';
import { getDynamoDBDocumentClient } from '../../db/dynamoClient';
import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { log } from '../../logger';
import FairwayModel from '../../db/fairwayModel';

export const handler: AppSyncResolverHandler<QueryFairwayArgs, Fairway> = async (event: AppSyncResolverEvent<QueryFairwayArgs>): Promise<Fairway> => {
  log.info(`fairway(${event.arguments.id})`);
  const client = getDynamoDBDocumentClient();
  const response = await client.send(new GetCommand({ TableName: process.env.FAIRWAY_TABLE, Key: { id: event.arguments.id } }));
  const fairway = response.Item as FairwayModel;
  log.debug('Fairway name: %s', fairway.name);
  return {
    id: event.arguments.id,
    name: {
      fi: 'Vuosaari',
      sv: 'Nordsjöleden',
      en: fairway.name,
    },
    length: 230,
    depth1: 15.5,
    depth2: 15,
    depth3: 14,
  };
};
