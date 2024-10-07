import { QueryCommand, QueryCommandInput, ScanCommand, ScanCommandInput } from '@aws-sdk/lib-dynamodb';
import fs from 'fs';
import path from 'path';
import Config from '../lib/config';
import { getDynamoDBDocumentClient } from '../lib/lambda/db/dynamoClient';
import FairwayCardDBModel from '../lib/lambda/db/fairwayCardDBModel';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Readable } from 'stream';

const PICTUREITEMS = ['flackgrund', 'lansisatama', 'kalajoki', 'raahe'];
const staticBucketName = Config.getNewStaticBucketName();

// Configure the DynamoDB client
const docClient = getDynamoDBDocumentClient();
const s3Client = new S3Client({ region: 'eu-west-1' });

// create a s3 download function which takes key, and local path as parameter
// and uses the staticBucketName for bucket
async function downloadFile(key: string, filePath: string) {
  const params = {
    Bucket: staticBucketName,
    Key: key,
  };

  const command = new GetObjectCommand(params);
  const response = await s3Client.send(command);

  const fileStream = fs.createWriteStream(filePath);
  if (response.Body instanceof Readable) response.Body?.pipe(fileStream);
}

async function getAllItemsById(tableName: string, cardId: string) {
  const params: QueryCommandInput = {
    TableName: tableName,
    KeyConditionExpression: '#pk = :pkValue',
    ExpressionAttributeNames: {
      '#pk': 'id',
    },
    ExpressionAttributeValues: {
      ':pkValue': cardId,
    },
  };

  const command = new QueryCommand(params);
  const response = await docClient.send(command);

  return response.Items as FairwayCardDBModel[];
}

async function downloadAndAnonymizeItems(tableName: string, outputDir: string) {
  console.log(`Processing table ${tableName}`);
  let processedCount = 0;
  let lastEvaluatedKey: Record<string, any> | undefined;

  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  do {
    // Scan the table to get all items
    const scanParams = {
      TableName: tableName,
      ExclusiveStartKey: lastEvaluatedKey,
    };

    const scanCommand = new ScanCommand(scanParams);
    const scanResponse = await docClient.send(scanCommand);

    if (scanResponse.Items) {
      for (const item of scanResponse.Items) {
        // Anonymize creator and modifier fields
        item.creator = 'System';
        item.modifier = 'System';
        // keep pictures only on selected few items
        if (!PICTUREITEMS.includes(item.id)) {
          item.pictures = undefined;
        }

        // Ensure id and version exist
        if (item.id && item.version) {
          const fileName = `${item.id}_${item.version}.json`;
          const filePath = path.join(outputDir, fileName);

          // Write item to individual JSON file
          fs.writeFileSync(filePath, JSON.stringify(item, null, 2));
          processedCount++;
        } else {
          console.warn('Skipping item due to missing id or version:', item);
        }
      }
    }

    lastEvaluatedKey = scanResponse.LastEvaluatedKey;
  } while (lastEvaluatedKey);

  console.log(`Downloaded and anonymized ${processedCount} items. Saved JSON files in ${outputDir} directory.`);
}

async function downloadPictures(tableName: string, outputDir: string) {
  let processedCount = 0;

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  for (const cardId of PICTUREITEMS) {
    const items = await getAllItemsById(Config.getFairwayCardWithVersionsTableName(), cardId);
    for (const item of items) {
      if (item.pictures?.length) {
        console.log(`Processing ${item.pictures.length} pictures for ${cardId}...`);
        for (const picture of item.pictures) {
          const key = `${item.id}/${item.version}/${picture.id}`;
          const filePath = path.join(outputDir, key);
          await downloadFile(key, filePath);
          processedCount++;
        }
      }
    }
  }

  console.log(`Downloaded ${processedCount} pictures. Saved files in ${outputDir} directory.`);
}

async function main() {
  await downloadAndAnonymizeItems(Config.getFairwayCardWithVersionsTableName(), 'data/cards2').catch(console.error);
  await downloadAndAnonymizeItems(Config.getHarborWithVersionsTableName(), 'data/harbors2').catch(console.error);
  await downloadPictures(Config.getFairwayCardWithVersionsTableName(), 'data/pictures').catch(console.error);
}

main().catch((e) => {
  console.log(e);
  process.exit(1);
});
