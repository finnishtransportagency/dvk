import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

let client: DynamoDBClient;

function getDynamoDBClient(): DynamoDBClient {
  if (!client) {
    client = new DynamoDBClient({ region: 'eu-west-1' });
  }
  return client;
}

export { getDynamoDBClient };
