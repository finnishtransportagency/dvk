import { PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { getDynamoDBDocumentClient } from '../lib/lambda/db/dynamoClient';
import Config from '../lib/config';

// migrate data from old table to new table and add first version to new items (v0 being always the latest version)

const client = getDynamoDBDocumentClient();

async function main() {
  const oldTable = await client.send(new ScanCommand({ TableName: Config.getFairwayCardTableName() }));

  const items = oldTable.Items;

  for (const item of items!) {
    const latestVersionItem = {
      ...item,
      version: 'v0',
      latest: 1,
    };
    const newItem = {
      ...item,
      version: 'v1',
    };

    await client.send(new PutCommand({ TableName: Config.getFairwayCardWithVersionsTableName(), Item: latestVersionItem }));
    await client.send(new PutCommand({ TableName: Config.getFairwayCardWithVersionsTableName(), Item: newItem }));
  }
}

main().catch((e) => {
  console.log(e);
  process.exit(1);
});
