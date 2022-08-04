import { ListTablesCommand } from '@aws-sdk/client-dynamodb';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import Config from '../lib/config';
import { getDynamoDBDocumentClient } from '../lib/lambda/db/dynamoClient';
import path from 'path';
import fs from 'fs';
import FairwayDBModel from '../lib/lambda/db/fairwayDBModel';

function getAllFiles(dirPath: string, arrayOfFiles: string[]) {
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];
  files.forEach(function (file) {
    if (fs.statSync(dirPath + '/' + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + '/' + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, '/', file));
    }
  });
  return arrayOfFiles;
}

async function main() {
  const response = await getDynamoDBDocumentClient().send(new ListTablesCommand({}));
  console.log(`Table names: ${response.TableNames?.join(', ')}`);
  const tableName = `Fairway-${Config.getEnvironment()}`;
  if (response.TableNames?.includes(tableName)) {
    const directoryPath = path.join(__dirname, 'data');
    const arrayOfFiles = getAllFiles(directoryPath, []);
    const geoTiffMap = new Map<number, string[]>();
    for (const file of arrayOfFiles.filter((f) => f.endsWith('.tif'))) {
      const id = file.match(/\/\d*\//)?.toString();
      if (id) {
        const fairwayId = parseInt(id.substring(1, id.length - 1), 10);
        if (!geoTiffMap.get(fairwayId)) {
          geoTiffMap.set(fairwayId, []);
        }
        geoTiffMap.get(fairwayId)?.push(file);
      }
    }
    for (const file of arrayOfFiles.filter((f) => f.endsWith('.json'))) {
      const fairway = JSON.parse(fs.readFileSync(file).toString()) as FairwayDBModel;
      if (geoTiffMap.get(fairway.id)) {
        fairway.geotiff = geoTiffMap.get(fairway.id)?.map((f) => {
          const i = f.lastIndexOf('/');
          return f.substring(i + 1);
        });
      }
      await getDynamoDBDocumentClient().send(new PutCommand({ TableName: tableName, Item: fairway }));
    }
    console.log(`Fairway table ${tableName} updated`);
  }
}

main().catch((e) => {
  console.log(e);
  process.exit(1);
});
