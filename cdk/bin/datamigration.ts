import { PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { getDynamoDBDocumentClient } from '../lib/lambda/db/dynamoClient';
import Config from '../lib/config';
import FairwayCardDBModel from '../lib/lambda/db/fairwayCardDBModel';
import { Status } from '../graphql/generated';

// migrate data from old table to new table and add first version to new items (v0 being always the latest version)

const client = getDynamoDBDocumentClient();

async function main() {
  const oldTable = await client.send(new ScanCommand({ TableName: Config.getFairwayCardTableName() }));

  const items = oldTable.Items as FairwayCardDBModel[];

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
        : undefined;
    const newItem = {
      ...item,
      version: 'v1',
    };

    await client.send(new PutCommand({ TableName: Config.getFairwayCardWithVersionsTableName(), Item: latestVersionItem }));
    await client.send(new PutCommand({ TableName: Config.getFairwayCardWithVersionsTableName(), Item: currentPublicItem }));
    await client.send(new PutCommand({ TableName: Config.getFairwayCardWithVersionsTableName(), Item: newItem }));
  }
}

main().catch((e) => {
  console.log(e);
  process.exit(1);
});
