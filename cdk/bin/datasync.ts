import { ListTablesCommand } from '@aws-sdk/client-dynamodb';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import Config from '../lib/config';
import { getDynamoDBDocumentClient } from '../lib/lambda/db/dynamoClient';
import path from 'path';
import fs from 'fs';
import FairwayCardDBModel from '../lib/lambda/db/fairwayCardDBModel';
// eslint-disable-next-line import/named
import { PutObjectCommand, PutObjectCommandOutput, S3Client } from '@aws-sdk/client-s3';
import { mapFairwayIds } from '../lib/lambda/db/modelMapper';

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
  return arrayOfFiles.filter((f) => !f.endsWith('template.json'));
}

function getGeoTiffMap(arrayOfFiles: string[]) {
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
  return geoTiffMap;
}

function isDbOnly(): boolean {
  return process.argv.includes('--dbonly');
}

function getBucketName() {
  if (Config.isProductionEnvironment()) {
    return `geotiff.dvk.vaylapilvi.fi`;
  } else {
    return `geotiff.dvk${Config.getEnvironment()}.testivaylapilvi.fi`;
  }
}

function processGeoTiff(filepath: string, id: number, s3Outputs: Promise<PutObjectCommandOutput>[]): string {
  const i = filepath.lastIndexOf('/');
  const filename = filepath.substring(i + 1);
  const command = new PutObjectCommand({
    Key: `${id}/${filename}`,
    Bucket: getBucketName(),
    Body: fs.readFileSync(filepath),
  });
  if (!isDbOnly()) {
    const s3Response = s3Client.send(command);
    s3Outputs.push(s3Response);
  }
  return filename;
}

async function processCard(file: string, geoTiffMap: Map<number, string[]>): Promise<FairwayCardDBModel> {
  const fairwayCard = JSON.parse(fs.readFileSync(file).toString()) as FairwayCardDBModel;
  fairwayCard.fairwayIds = mapFairwayIds(fairwayCard);
  fairwayCard.modificationTimestamp = Math.round(Date.now() / 1000);
  const s3Outputs: Promise<PutObjectCommandOutput>[] = [];
  console.log(`Fairway card: ${fairwayCard.name?.fi}`);
  for (const fairway of fairwayCard.fairways) {
    console.log(`Fairway: ${fairway.id}`);
    if (geoTiffMap.get(fairway.id)) {
      fairway.geotiffImages = geoTiffMap.get(fairway.id)?.map((f) => {
        return processGeoTiff(f, fairway.id, s3Outputs);
      });
    }
  }
  if (!isDbOnly()) {
    await Promise.all(s3Outputs);
    console.log(`${s3Outputs.length || 0} image(s) uploaded`);
  }
  return fairwayCard;
}

function getRootDirectory(): string {
  if (process.argv.length < 3 || process.argv[2].startsWith('--')) {
    return path.join(__dirname, 'data');
  } else {
    return path.join(__dirname, 'data', process.argv[2]);
  }
}

async function main() {
  const response = await getDynamoDBDocumentClient().send(new ListTablesCommand({}));
  console.log(`Table names: ${response.TableNames?.join(', ')}`);
  const tableName = `FairwayCard-${Config.getEnvironment()}`;
  if (response.TableNames?.includes(tableName)) {
    const directoryPath = getRootDirectory();
    console.log(`Scanning directory: ${directoryPath}`);
    const arrayOfFiles = getAllFiles(directoryPath, []);
    const geoTiffMap = getGeoTiffMap(arrayOfFiles);
    for (const file of arrayOfFiles.filter((f) => f.endsWith('.json'))) {
      const fairwayCard = await processCard(file, geoTiffMap);
      await getDynamoDBDocumentClient().send(new PutCommand({ TableName: tableName, Item: fairwayCard }));
    }
    console.log(`FairwayCard table ${tableName} updated`);
  }
}

main().catch((e) => {
  console.log(e);
  process.exit(1);
});
