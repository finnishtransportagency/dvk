import { PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { getDynamoDBDocumentClient } from '../lib/lambda/db/dynamoClient';
import Config from '../lib/config';
import FairwayCardDBModel from '../lib/lambda/db/fairwayCardDBModel';
import { Status } from '../graphql/generated';
import HarborDBModel from '../lib/lambda/db/harborDBModel';

// migrate data from old table to new table and add first version to new items (v0 being always the latest version)

const client = getDynamoDBDocumentClient();

async function migrateData(oldTableName: string, newTableName: string, fairwayCards: boolean) {
  const oldTable = await client.send(new ScanCommand({ TableName: oldTableName }));

  const items = fairwayCards ? oldTable.Items as FairwayCardDBModel[] : oldTable.Items as HarborDBModel[];

  for (const item of items) {
    // three different objects for one item:
    // latest one is retrieved from v0_latest (regardless of status)
    // the public one from currentPublicItem if there's one
    // and the actual item which results to v1
    const latestVersionItem = {
      ...item,
      version: 'v0_latest',
      latest: 1,
    };
    const currentPublicItem =
      item.status === Status.Public
        ? {
            ...item,
            version: 'v0_public',
            currentPublic: 1,
          }
        : 
          {
            ...item,
            version: 'v0_public',
            currentPublic: null,
          }
        ;
    const newItem = {
      ...item,
      version: 'v1',
    };
    await client.send(new PutCommand({ TableName: newTableName, Item: latestVersionItem }));
    await client.send(new PutCommand({ TableName: newTableName, Item: currentPublicItem }));
    await client.send(new PutCommand({ TableName: newTableName, Item: newItem }));
  }
}

async function main() {
  // migrate fairway card data
  console.time('Fairway card data migrated in');
  await migrateData(Config.getFairwayCardTableName(), Config.getFairwayCardWithVersionsTableName(), true);
  console.timeEnd('Fairway card data migrated in');
  console.log('-------------------------------')
  console.time('Harbor data migrated in');
  await migrateData(Config.getHarborTableName(), Config.getHarborWithVersionsTableName(), false);
  console.timeEnd('Harbor data migrated in');
}

main().catch((e) => {
  console.log(e);
  process.exit(1);
});
