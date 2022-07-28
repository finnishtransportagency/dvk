import { ListTablesCommand } from '@aws-sdk/client-dynamodb';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import Config from '../lib/config';
import { getDynamoDBDocumentClient } from '../lib/lambda/db/dynamoClient';
import vuosaariJson from './data/vuosaari.json';
import kemiJson from './data/kemi.json';
import uusikaupunkiJson from './data/uusikaupunki.json';

async function main() {
  const response = await getDynamoDBDocumentClient().send(new ListTablesCommand({}));
  console.log(`Table names : ${response.TableNames}`);
  const tableName = `Fairway-${Config.getEnvironment()}`;
  if (response.TableNames?.includes(tableName)) {
    await getDynamoDBDocumentClient().send(new PutCommand({ TableName: tableName, Item: vuosaariJson }));
    await getDynamoDBDocumentClient().send(new PutCommand({ TableName: tableName, Item: kemiJson }));
    await getDynamoDBDocumentClient().send(new PutCommand({ TableName: tableName, Item: uusikaupunkiJson }));
    console.log(`Fairway table ${tableName} updated`);
  }
}

main().catch((e) => {
  console.log(e);
  process.exit(1);
});
