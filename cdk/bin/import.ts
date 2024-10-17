import { ListTablesCommand } from '@aws-sdk/client-dynamodb';
import { PutCommand, DeleteCommand, ScanCommand, ScanCommandInput, DeleteCommandInput } from '@aws-sdk/lib-dynamodb';
import Config from '../lib/config';
import { getDynamoDBDocumentClient } from '../lib/lambda/db/dynamoClient';
import path from 'path';
import fs from 'fs';
import { PutObjectCommand, PutObjectCommandInput, S3Client } from '@aws-sdk/client-s3';

const s3Client = new S3Client({ region: 'eu-west-1' });

const staticBucketName = Config.getNewStaticBucketName();

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

function getRootDirectory(dir: string): string {
  return path.join(__dirname, 'data', dir);
}

async function updateTable(tableName: string, directoryPath: string) {
  console.log(`Scanning directory: ${directoryPath}`);
  const arrayOfFiles = getAllFiles(directoryPath, []);
  const args = process.argv.filter((x) => x !== '--reset');
  for (const file of arrayOfFiles.filter((f) => f.endsWith('.json') && (args.length === 2 || args.slice(2).some((arg) => f.indexOf(arg) >= 0)))) {
    const item = JSON.parse(fs.readFileSync(file).toString());
    await getDynamoDBDocumentClient().send(new PutCommand({ TableName: tableName, Item: item }));
  }
}

async function deleteTableData(tableName: string) {
  let lastEvaluatedKey: Record<string, any> | undefined;
  do {
    const scanParams: ScanCommandInput = {
      TableName: tableName,
    };
    if (lastEvaluatedKey) {
      scanParams.ExclusiveStartKey = lastEvaluatedKey;
    }
    const scanResult = await getDynamoDBDocumentClient().send(new ScanCommand(scanParams));
    if (scanResult.Items && scanResult.Items.length > 0) {
      for (const item of scanResult.Items) {
        const deleteParams: DeleteCommandInput = { TableName: tableName, Key: { id: item.id, version: item.version } };
        await getDynamoDBDocumentClient().send(new DeleteCommand(deleteParams));
        console.log(`${item.id} deleted`);
      }
    }

    lastEvaluatedKey = scanResult.LastEvaluatedKey;
  } while (lastEvaluatedKey);
  console.log('Table data deletion complete.');
}

async function uploadToS3(dir: string) {
  const arrayOfFiles = getAllFiles(dir, []);
  let uploadedCount = 0;
  const allFilesCount = arrayOfFiles.length;
  for (const file of arrayOfFiles) {
    const fileContent = fs.readFileSync(file);
    const relativeFilePath = path.relative(dir, file);
    const params: PutObjectCommandInput = {
      Bucket: staticBucketName,
      Key: relativeFilePath.replace(/\\/g, '/'), // Ensure forward slashes for S3 keys
      Body: fileContent,
    };
    const command = new PutObjectCommand(params);

    try {
      console.log(`Uploading file [${uploadedCount + 1}/${allFilesCount}}]: ${relativeFilePath}`);
      await s3Client.send(command);
      uploadedCount++;
    } catch (error) {
      console.error(`Error uploading file ${relativeFilePath}:`, error);
    }
  }

  console.log(`Total files uploaded: ${uploadedCount}/${allFilesCount}`);
}

async function main() {
  const environment = process.env.ENVIRONMENT;

  if (environment === 'prod') {
    console.error('Error: This script should not be run in the production environment.');
    console.error('Please use a non-production environment to run this import script.');
    process.exit(1);
  }

  if (!environment) {
    console.error('Error: ENVIRONMENT variable is not set.');
    process.exit(1);
  }

  const response = await getDynamoDBDocumentClient().send(new ListTablesCommand({}));
  const filteredTableNames = response.TableNames?.filter(name => name.includes(environment)) || [];
  console.log(`Table names: ${filteredTableNames.join(', ')}`);
  let tableName = Config.getFairwayCardWithVersionsTableName();
  if (filteredTableNames.includes(tableName)) {
    if (process.argv.includes('--reset')) {
      console.log('Deleting existing fairway cards');
      await deleteTableData(tableName);
    }
    await updateTable(tableName, getRootDirectory('cards2'));
    console.log(`FairwayCard table ${tableName} updated`);
  }
  tableName = Config.getHarborWithVersionsTableName();
  if (filteredTableNames.includes(tableName)) {
    if (process.argv.includes('--reset')) {
      console.log('Deleting existing harbors');
      await deleteTableData(tableName);
    }
    await updateTable(tableName, getRootDirectory('harbors2'));
    console.log(`Harbor table ${tableName} updated`);
  }
  await uploadToS3(getRootDirectory('pictures'));
}

main().catch((e) => {
  console.log(e);
  process.exit(1);
});
