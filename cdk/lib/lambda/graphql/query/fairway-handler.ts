import { GetItemCommand, GetItemInput } from '@aws-sdk/client-dynamodb';
import { AppSyncResolverEvent, AppSyncResolverHandler } from 'aws-lambda/trigger/appsync-resolver';
import { Fairway, QueryFairwayArgs } from '../../../../graphql/generated';
import { getDynamoDBClient } from '../../db/dynamoClient';
import { log } from '../../logger';

export const handler: AppSyncResolverHandler<QueryFairwayArgs, Fairway> = async (event: AppSyncResolverEvent<QueryFairwayArgs>): Promise<Fairway> => {
  log.info(`fairway(${event.arguments.id})`);
  const client = getDynamoDBClient();
  const params: GetItemInput = {
    TableName: process.env.FAIRWAY_TABLE,
    Key: {
      id: { N: event.arguments.id.toString() },
    },
  };
  const command = new GetItemCommand(params);
  const response = await client.send(command);
  log.info(`response: ${response}`);
  return {
    id: event.arguments.id,
    name: {
      fi: 'Vuosaari',
      sv: 'Nordsjöleden',
      en: '',
    },
    length: 230,
    depth1: 15.5,
    depth2: 15,
    depth3: 14,
  };
};
