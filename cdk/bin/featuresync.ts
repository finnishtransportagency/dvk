import axios from 'axios';
import fs from 'fs';
import { gzip } from 'zlib';
import Config from '../lib/config';
// eslint-disable-next-line import/named
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

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

function getBucketName() {
  return `static.dvk${Config.getEnvironment()}.testivaylapilvi.fi`;
}

async function saveToS3(filename: string, data: Buffer) {
  const command = new PutObjectCommand({
    Key: filename,
    Bucket: getBucketName(),
    Body: data,
    ContentType: 'application/json',
    ContentEncoding: 'gzip',
  });
  await s3Client.send(command);
}

async function main() {
  const featureLoaderUrl = 'http://localhost:8080/api/featureloader';
  const sources = [
    { id: 'area12', url: new URL(featureLoaderUrl + '?type=area&vaylaluokka=1,2') },
    { id: 'area3456', url: new URL(featureLoaderUrl + '?type=area&vaylaluokka=3,4,5,6') },
    { id: 'line12', url: new URL(featureLoaderUrl + '?type=line&vaylaluokka=1,2') },
    { id: 'line3456', url: new URL(featureLoaderUrl + '?type=line&vaylaluokka=3,4,5,6') },
    { id: 'restrictionarea', url: new URL(featureLoaderUrl + '?type=restrictionarea&vaylaluokka=1,2') },
    { id: 'specialarea', url: new URL(featureLoaderUrl + '?type=specialarea&vaylaluokka=1,2,3,4,5,6') },
    { id: 'pilot', url: new URL(featureLoaderUrl + '?type=pilot') },
    { id: 'harbor', url: new URL(featureLoaderUrl + '?type=harbor') },
    { id: 'safetyequipment', url: new URL(featureLoaderUrl + '?type=safetyequipment&vaylaluokka=1,2,99') },
    { id: 'depth12', url: new URL(featureLoaderUrl + '?type=depth&vaylaluokka=1,2') },
    { id: 'safetyequipmentfault', url: new URL(featureLoaderUrl + '?type=safetyequipmentfault') },
    { id: 'marinewarning', url: new URL(featureLoaderUrl + '?type=marinewarning') },
    { id: 'boardline12', url: new URL(featureLoaderUrl + '?type=boardline&vaylaluokka=1,2') },
    { id: 'mareograph', url: new URL(featureLoaderUrl + '?type=mareograph') },
    { id: 'observation', url: new URL(featureLoaderUrl + '?type=observation') },
    { id: 'buoy', url: new URL(featureLoaderUrl + '?type=buoy') },
  ];
  for (const source of sources) {
    const response = await axios.get(source.url.toString(), {
      responseType: 'blob',
      headers: {
        'Content-Type': 'application/json',
        'Accept-Encoding': 'gzip',
      },
    });
    const data = await gzipString(response.data);
    const filename = source.id + '.json.gz';
    fs.writeFileSync(filename, data);
    await saveToS3(filename, data);
    console.log(`${filename} uploaded to S3 bucket ${getBucketName()}`);
  }
}

main().catch((e) => {
  console.log(e);
  process.exit(1);
});
