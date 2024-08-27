import { ListTablesCommand } from '@aws-sdk/client-dynamodb';
import { PutCommand, DeleteCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import Config from '../lib/config';
import { getDynamoDBDocumentClient } from '../lib/lambda/db/dynamoClient';
import path from 'path';
import fs from 'fs';
import FairwayCardDBModel from '../lib/lambda/db/fairwayCardDBModel';
import { mapFairwayIds } from '../lib/lambda/db/modelMapper';
import HarborDBModel from '../lib/lambda/db/harborDBModel';

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
  fairwayCard.creationTimestamp = Date.now();
  fairwayCard.creator = 'System';
  fairwayCard.modificationTimestamp = Date.now();
  fairwayCard.modifier = 'System';
  console.log(`Fairway card: ${fairwayCard.name?.fi}`);
  return fairwayCard;
}

function processHarbor(file: string): HarborDBModel {
  const harbor: HarborDBModel = JSON.parse(fs.readFileSync(file).toString());
  harbor.creationTimestamp = Date.now();
  harbor.creator = 'System';
  harbor.modificationTimestamp = Date.now();
  harbor.modifier = 'System';
  console.log(`Harbor: ${harbor.name?.fi}`);
  return harbor;
}

function getRootDirectory(dir: string): string {
  return path.join(__dirname, 'data', dir);
}

async function updateTable(tableName: string, directoryPath: string, card: boolean) {
  console.log(`Scanning directory: ${directoryPath}`);
  const arrayOfFiles = getAllFiles(directoryPath, []);
  const args = process.argv.filter((x) => x !== '--reset');
  for (const file of arrayOfFiles.filter((f) => f.endsWith('.json') && (args.length === 2 || args.slice(2).some((arg) => f.indexOf(arg) >= 0)))) {
    const item = card ? await processCard(file) : processHarbor(file);
    await getDynamoDBDocumentClient().send(new PutCommand({ TableName: tableName, Item: item }));
  }
}

async function deleteTableData(tableName: string) {
  const items = await getDynamoDBDocumentClient().send(new ScanCommand({ TableName: tableName }));
  for (const item of items.Items ?? []) {
    await getDynamoDBDocumentClient().send(new DeleteCommand({ TableName: tableName, Key: { id: item.id } }));
    console.log(`${item.id} deleted`);
  }
}

async function main() {
  const response = await getDynamoDBDocumentClient().send(new ListTablesCommand({}));
  console.log(`Table names: ${response.TableNames?.join(', ')}`);
  let tableName = Config.getFairwayCardWithVersionsTableName();
  if (response.TableNames?.includes(tableName)) {
    if (process.argv.includes('--reset')) {
      console.log('Deleting existing fairway cards');
      await deleteTableData(tableName);
    }
    await updateTable(tableName, getRootDirectory('cards'), true);
    console.log(`FairwayCard table ${tableName} updated`);
  }
  tableName = Config.getHarborWithVersionsTableName();
  if (response.TableNames?.includes(tableName)) {
    if (process.argv.includes('--reset')) {
      console.log('Deleting existing harbors');
      await deleteTableData(tableName);
    }
    await updateTable(tableName, getRootDirectory('harbors'), false);
    console.log(`Harbor table ${tableName} updated`);
  }
}

main().catch((e) => {
  console.log(e);
  process.exit(1);
});
