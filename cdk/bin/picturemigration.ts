import { ScanCommand, ScanCommandInput } from '@aws-sdk/lib-dynamodb';
import { getDynamoDBDocumentClient } from '../lib/lambda/db/dynamoClient';
import Config from '../lib/config';
import FairwayCardDBModel from '../lib/lambda/db/fairwayCardDBModel';
import { CopyObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getNewStaticBucketName } from '../lib/lambda/environment';

const dynamoDBClient = getDynamoDBDocumentClient();
const s3Client = new S3Client({ region: 'eu-west-1' });
const tableName = Config.getFairwayCardWithVersionsTableName();
const bucketName = getNewStaticBucketName();

async function migratePictures() {
  const params: ScanCommandInput = {
    TableName: tableName,
    FilterExpression: '#version <> :publicVersion AND #version <> :latestVersion',
    ExpressionAttributeNames: {
      '#version': 'version',
    },
    ExpressionAttributeValues: { ':publicVersion': FairwayCardDBModel.getPublicSortKey(), ':latestVersion': FairwayCardDBModel.getLatestSortKey() },
  };

  const table = await dynamoDBClient.send(new ScanCommand(params));
  const cards = table.Items as FairwayCardDBModel[];

  let itemsHandled = 0;
  let itemsCopied = 0;
  console.log('\nMIGRATING PICTURES');

  for (const card of cards) {
    if (card.pictures?.length) {
      console.log(`Migrating card ${card.id}/${card.version}, picture count: ${card.pictures.length}`);
      itemsHandled += card.pictures.length;
      const promises = [];

      try {
        for (const picture of card.pictures) {
          console.log('Migrating item... ' + picture.id);
          const newKey = `${card.id}/${card.version}/${picture.id}`;

          const command = new CopyObjectCommand({
            Key: newKey,
            Bucket: bucketName,
            CopySource: `${bucketName}/${card.id}/${picture.id}`,
          });
          promises.push(s3Client.send(command));
        }
        const result = await Promise.all(promises);
        console.log(`Card ${card.id} migration completed, picture count: ${result.length}`);
        itemsCopied += result.length;
      } catch (error) {
        console.log(error);
      }
    } else {
      console.log(`Card ${card.id}/${card.version} has no pictures, skipping...`);
    }
  }
  console.log(`Migrated ${itemsCopied} pictures in total`);
  console.log('\n' + (itemsHandled === itemsCopied) ? 'EVERYTHING SHOULD BE OK!\n' : 'SOMETHING MIGHT HAVE GONE WRONG\n');
}

async function main() {
  // Copy fairway card pictures in S3, add card version to object key
  console.time('Pictures migrated in');
  await migratePictures();
  console.timeEnd('Pictures migrated in');
}

main().catch((e) => {
  console.log(e);
  process.exit(1);
});
