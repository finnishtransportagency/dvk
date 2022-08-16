// eslint-disable-next-line import/named
import { ListTablesCommand } from '@aws-sdk/client-dynamodb';
// eslint-disable-next-line import/named
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import Config from '../lib/config';
import { getDynamoDBDocumentClient } from '../lib/lambda/db/dynamoClient';
import path from 'path';
import fs from 'fs';
import FairwayDBModel from '../lib/lambda/db/fairwayDBModel';
// eslint-disable-next-line import/named
import { PutObjectCommand, PutObjectCommandOutput, S3Client } from '@aws-sdk/client-s3';

const s3Client = new S3Client({ region: 'eu-west-1' });

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
      const s3Outputs: Promise<PutObjectCommandOutput>[] = [];
      if (geoTiffMap.get(fairway.id)) {
        fairway.geotiffImages = geoTiffMap.get(fairway.id)?.map((f) => {
          const i = f.lastIndexOf('/');
          const filename = f.substring(i + 1);
          const command = new PutObjectCommand({
            Key: `${fairway.id}/${filename}`,
            Bucket: `geotiff.dvk${Config.getEnvironment()}.testivaylapilvi.fi`,
            Body: fs.readFileSync(f),
          });
          const s3Response = s3Client.send(command);
          s3Outputs.push(s3Response);
          return filename;
        });
        await Promise.all(s3Outputs);
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
