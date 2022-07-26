import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

let client: DynamoDBDocumentClient;

function getDynamoDBDocumentClient(): DynamoDBDocumentClient {
  if (!client) {
    client = DynamoDBDocumentClient.from(new DynamoDBClient({ region: 'eu-west-1' }));
  }
  return client;
}

export { getDynamoDBDocumentClient };
