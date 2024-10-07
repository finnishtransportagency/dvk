import { ScanCommand } from '@aws-sdk/lib-dynamodb';
import fs from 'fs';
import path from 'path';
import Config from '../lib/config';
import { getDynamoDBDocumentClient } from '../lib/lambda/db/dynamoClient';

// Configure the DynamoDB client
const docClient = getDynamoDBDocumentClient();

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

async function main() {
  await downloadAndAnonymizeItems(Config.getFairwayCardWithVersionsTableName(), 'data/cards2').catch(console.error);
  await downloadAndAnonymizeItems(Config.getHarborWithVersionsTableName(), 'data/harbors2').catch(console.error);
}

main().catch((e) => {
  console.log(e);
  process.exit(1);
});
