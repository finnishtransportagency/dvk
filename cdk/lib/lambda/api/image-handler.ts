import { ALBEvent, ALBResult } from 'aws-lambda';
import { log } from '../logger';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getNewStaticBucketName } from '../environment';
import { Readable } from 'stream';

const s3Client = new S3Client({ region: 'eu-west-1' });

async function getPicture(key?: string) {
  try {
    if (key) {
      const data = await s3Client.send(
        new GetObjectCommand({
          Key: key,
          Bucket: getNewStaticBucketName(),
        })
      );
      if (data.Body) {
        log.debug(`returning ${key} from s3 bucket`);
        const streamToString = (stream: Readable): Promise<string> =>
          new Promise((resolve, reject) => {
            const chunks: Uint8Array[] = [];
            stream.on('data', (chunk: Uint8Array) => chunks.push(chunk));
            stream.on('error', reject);
            stream.on('end', () => resolve(Buffer.concat(chunks).toString('base64')));
          });
        return {
          data: await streamToString(data.Body as Readable),
          contentType: data.ContentType,
        };
      }
    }
  } catch (e) {
    // errors ignored also not found
  }
  return {
    data: undefined,
  };
}

export const handler = async (event: ALBEvent): Promise<ALBResult> => {
  log.debug(`image()`);
  const picture = await getPicture(event.queryStringParameters?.id);
  return {
    statusCode: picture.data ? 200 : 404,
    headers: {
      'Content-Type': picture?.contentType ?? 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': '*',
      'Access-Control-Allow-Headers': '*',
    },
    body: picture?.data,
    isBase64Encoded: true,
  };
};
