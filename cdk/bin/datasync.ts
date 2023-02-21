import { ListTablesCommand } from '@aws-sdk/client-dynamodb';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import Config from '../lib/config';
import { getDynamoDBDocumentClient } from '../lib/lambda/db/dynamoClient';
import path from 'path';
import fs from 'fs';
import FairwayCardDBModel from '../lib/lambda/db/fairwayCardDBModel';
import { mapFairwayIds } from '../lib/lambda/db/modelMapper';
import HarborDBModel from '../lib/lambda/db/harborDBModel';
import PilotPlaceDBModel from '../lib/lambda/db/pilotPlaceDBModel';

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

async function processCard(file: string): Promise<FairwayCardDBModel> {
  const fairwayCard = JSON.parse(fs.readFileSync(file).toString()) as FairwayCardDBModel;
  fairwayCard.fairwayIds = mapFairwayIds(fairwayCard);
  fairwayCard.modificationTimestamp = Date.now();
  console.log(`Fairway card: ${fairwayCard.name?.fi}`);
  return fairwayCard;
}

function processHarborOrPilotPlace(file: string): HarborDBModel | PilotPlaceDBModel {
  const jsonObj: HarborDBModel | PilotPlaceDBModel = JSON.parse(fs.readFileSync(file).toString());
  if ('company' in jsonObj) {
    console.log(`Harbor: ${jsonObj.name?.fi}`);
  } else {
    console.log(`PilotPlace: ${jsonObj.name}`);
  }
  return jsonObj;
}

function getRootDirectory(dir: string): string {
  return path.join(__dirname, 'data', dir);
}

async function updateTable(tableName: string, directoryPath: string, card: boolean) {
  console.log(`Scanning directory: ${directoryPath}`);
  const arrayOfFiles = getAllFiles(directoryPath, []);
  for (const file of arrayOfFiles.filter(
    (f) => f.endsWith('.json') && (process.argv.length === 2 || process.argv.slice(2).some((arg) => f.indexOf(arg) >= 0))
  )) {
    const item = card ? await processCard(file) : processHarborOrPilotPlace(file);
    await getDynamoDBDocumentClient().send(new PutCommand({ TableName: tableName, Item: item }));
  }
}

async function main() {
  const response = await getDynamoDBDocumentClient().send(new ListTablesCommand({}));
  console.log(`Table names: ${response.TableNames?.join(', ')}`);
  let tableName = Config.getFairwayCardTableName();
  if (response.TableNames?.includes(tableName)) {
    await updateTable(tableName, getRootDirectory('cards'), true);
    console.log(`FairwayCard table ${tableName} updated`);
  }
  tableName = Config.getHarborTableName();
  if (response.TableNames?.includes(tableName)) {
    await updateTable(tableName, getRootDirectory('harbors'), false);
    console.log(`Harbor table ${tableName} updated`);
  }
  tableName = Config.getPilotPlaceTableName();
  if (response.TableNames?.includes(tableName)) {
    await updateTable(tableName, getRootDirectory('pilots'), false);
    console.log(`PilotPlace table ${tableName} updated`);
  }
}

main().catch((e) => {
  console.log(e);
  process.exit(1);
});
