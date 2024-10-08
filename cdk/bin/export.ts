import { QueryCommand, QueryCommandInput, ScanCommand, ScanCommandInput } from '@aws-sdk/lib-dynamodb';
import fs from 'fs';
import path from 'path';
import Config from '../lib/config';
import { getDynamoDBDocumentClient } from '../lib/lambda/db/dynamoClient';
import FairwayCardDBModel from '../lib/lambda/db/fairwayCardDBModel';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Readable } from 'stream';

const PICTUREITEMS = ['lansisatama', 'kalajoki', 'raahe'];
const staticBucketName = Config.getNewStaticBucketName();

// Configure the DynamoDB and s3 clients
const docClient = getDynamoDBDocumentClient();
const s3Client = new S3Client({ region: 'eu-west-1' });

async function downloadFile(key: string, filePath: string): Promise<void> {
  const params = {
    Bucket: staticBucketName,
    Key: key,
  };

  const command = new GetObjectCommand(params);
  const response = await s3Client.send(command);

  // Ensure the directory exists
  const directory = path.dirname(filePath);
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }

  return new Promise((resolve, reject) => {
    const fileStream = fs.createWriteStream(filePath);

    if (response.Body instanceof Readable) {
      response.Body.pipe(fileStream);
    } else {
      reject(new Error('Response body is not a readable stream'));
      return;
    }

    fileStream.on('finish', () => {
      fileStream.close();
      resolve();
    });

    fileStream.on('error', (error) => {
      fileStream.close();
      reject(error);
    });
  });
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

async function listAllPictures(cardIds: string[]): Promise<Array<{ item: FairwayCardDBModel; picture: any }>> {
  const allItems = await Promise.all(cardIds.map((cardId) => getAllItemsById(Config.getFairwayCardWithVersionsTableName(), cardId)));

  return allItems.flatMap((items, index) => items.flatMap((item) => (item.pictures || []).map((picture) => ({ item, picture }))));
}

async function downloadAllPictures(pictures: Array<{ item: FairwayCardDBModel; picture: any }>, outputDir: string): Promise<boolean[]> {
  return Promise.all(
    pictures.map(async ({ item, picture }) => {
      let key = '';
      if (item.version == FairwayCardDBModel.getPublicSortKey() || item.version == FairwayCardDBModel.getLatestSortKey()) {
        key = `${item.id}/${picture.id}`;
      } else {
        key = `${item.id}/${item.version}/${picture.id}`;
      }
      const filePath = path.join(outputDir, key);
      console.log(`Processing picture ${key} for ${item.id}...`);
      try {
        await downloadFile(key, filePath);
        return true;
      } catch (error) {
        console.error(`Failed to download picture ${key}:`, error);
        return false;
      }
    })
  );
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
  const allPictures = await listAllPictures(PICTUREITEMS);
  const downloadResults = await downloadAllPictures(allPictures, outputDir);
  const processedCount = downloadResults.filter((result) => result).length;
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
