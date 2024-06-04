import axios from 'axios';
import fs from 'fs';
import { gzip } from 'zlib';
// eslint-disable-next-line import/named
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getNewStaticBucketName } from '../lib/lambda/environment';

const s3Client = new S3Client({ region: 'eu-west-1' });

const gzipString = async (input: string): Promise<Buffer> => {
  const buffer = Buffer.from(input);
  return new Promise((resolve, reject) =>
    gzip(buffer, (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(data);
    })
  );
};

async function saveToS3(filename: string, data: Buffer) {
  const command = new PutObjectCommand({
    Key: filename,
    Bucket: getNewStaticBucketName(),
    Body: data,
    ContentType: 'application/json',
    ContentEncoding: 'gzip',
  });
  await s3Client.send(command);
}

async function main() {
  const pilotRoutesUrl = 'http://localhost:8080/api/pilotroutes';
  const pilotRouteSource = { id: 'pilotroutes', url: new URL(pilotRoutesUrl) };

  const response = await axios.get(pilotRouteSource.url.toString(), {
    responseType: 'blob',
    headers: {
      'Content-Type': 'application/json',
      'Accept-Encoding': 'gzip',
    },
  });
  const data = await gzipString(response.data);
  const filename = pilotRouteSource.id + '.json.gz';
  fs.writeFileSync(filename, data);
  await saveToS3(filename, data);
  console.log(`${filename} uploaded to S3 bucket ${getNewStaticBucketName()}`);
}

main().catch((e) => {
  console.log(e);
  process.exit(1);
});
