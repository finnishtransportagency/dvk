import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getEnvironment } from '../environment';
import { log } from '../logger';
import { Readable } from 'stream';

const s3Client = new S3Client({ region: 'eu-west-1' });

const AIS_LOCATION_CACHE_DURATION = 10;
const AIS_VESSEL_CACHE_DURATION = 1800;
const FEATURE_CACHE_DURATION = 7200;

function getCacheBucketName() {
  return `featurecache-${getEnvironment()}`;
}

export async function getFeatureCacheDuration(key: string) {
  if (key === 'aislocations') {
    return AIS_LOCATION_CACHE_DURATION;
  } else if (key === 'aisvessels') {
    return AIS_VESSEL_CACHE_DURATION;
  } else {
    return FEATURE_CACHE_DURATION;
  }
}

export async function cacheResponse(key: string, response: object | string) {
  const cacheDurationSeconds = await getFeatureCacheDuration(key);
  const expires = new Date();
  expires.setTime(expires.getTime() + cacheDurationSeconds * 1000);
  const command = new PutObjectCommand({
    Key: key,
    Bucket: getCacheBucketName(),
    Expires: expires,
    Body: typeof response === 'string' ? response : JSON.stringify(response),
  });
  await s3Client.send(command);
}

export type CacheResponse = {
  expired: boolean;
  data?: string;
  lastModified?: string;
};

export async function getFromCache(key: string): Promise<CacheResponse> {
  try {
    const data = await s3Client.send(
      new GetObjectCommand({
        Key: key,
        Bucket: getCacheBucketName(),
      })
    );
    if (data.Body) {
      log.debug(`returning ${key} from cache`);
      const streamToString = (stream: Readable): Promise<string> =>
        new Promise((resolve, reject) => {
          const chunks: Uint8Array[] = [];
          stream.on('data', (chunk: Uint8Array) => chunks.push(chunk));
          stream.on('error', reject);
          stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
        });
      return {
        expired: data.Expires !== undefined && data.Expires.getTime() < Date.now(),
        data: await streamToString(data.Body as Readable),
        lastModified: data.LastModified?.toUTCString(),
      };
    }
  } catch (e) {
    // errors ignored also not found
  }
  return { expired: true };
}
