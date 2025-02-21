import { PutObjectCommand, PutObjectCommandInput, S3Client } from "@aws-sdk/client-s3";
import Config from "../lib/config";
import path from "path";
import fs from 'fs';

const s3Client = new S3Client({ region: 'eu-west-1' });

const staticBucketName = Config.getNewStaticBucketName();

async function uploadToS3(dir: string) {
  const filePath = path.join(__dirname, 'data', dir);
  const files = fs.readdirSync(filePath);
  const fileContent = fs.readFileSync(filePath + '/' + files[0]);

  const params: PutObjectCommandInput = {
    Bucket: staticBucketName,
    Key: 'staticVts',
    Body: fileContent,
  }
  const command = new PutObjectCommand(params);

  try {
    console.log('uploading file');
    await s3Client.send(command);
    console.log('You did good!');
  } catch (error) {
    console.error('Oh shit!');
  }
}

async function main() {
  uploadToS3('vts');
}

main().catch((e) => {
  console.log(e);
  process.exit(1);
});