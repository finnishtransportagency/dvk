import { DeleteObjectsCommand, GetObjectCommand, ObjectIdentifier, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getEnvironment } from '../environment';
import { log } from '../logger';
import { Readable } from 'stream';

const s3Client = new S3Client({ region: 'eu-west-1' });

const AIS_LOCATION_CACHE = {
  MAX_AGE: 2, // 2 seconds
  STALE_WHILE_REVALIDATE: 3, // 3 seconds
  STALE_IF_ERROR: 58, // 58 seconds (do not return location data more than 1 minute old)
};
const AIS_VESSEL_CACHE = {
  MAX_AGE: 300, // 5 minutes
  STALE_WHILE_REVALIDATE: 60, // 1 minute
  STALE_IF_ERROR: 300, // 5 minutes (do not return vessel data more than 10 minutes old)
};

export const FEATURE_CACHE_DURATION = 7200; // 2 hours

function getCacheBucketName() {
  return `featurecache-${getEnvironment()}`;
}

export function getFeatureCacheDuration(key: string) {
  if (key === 'aislocations') {
    return AIS_LOCATION_CACHE.MAX_AGE;
  } else if (key === 'aisvessels') {
    return AIS_VESSEL_CACHE.MAX_AGE;
  } else {
    return FEATURE_CACHE_DURATION;
  }
}

export function getCacheControlHeaders(key: string): Record<string, string[]> {
  if (key === 'aislocations') {
    return {
      'Cache-Control': [
        'max-age=' +
          AIS_LOCATION_CACHE.MAX_AGE +
          ', ' +
          'stale-while-revalidate=' +
          AIS_LOCATION_CACHE.STALE_WHILE_REVALIDATE +
          ', ' +
          'stale-if-error=' +
          AIS_LOCATION_CACHE.STALE_IF_ERROR,
      ],
    };
  } else if (key === 'aisvessels') {
    return {
      'Cache-Control': [
        'max-age=' +
          AIS_VESSEL_CACHE.MAX_AGE +
          ', ' +
          'stale-while-revalidate=' +
          AIS_VESSEL_CACHE.STALE_WHILE_REVALIDATE +
          ', ' +
          'stale-if-error=' +
          AIS_VESSEL_CACHE.STALE_IF_ERROR,
      ],
    };
  } else {
    return {};
  }
}

export async function cacheResponse(key: string, response: object | string) {
  const cacheDurationSeconds = getFeatureCacheDuration(key);
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
      const expires = data.ExpiresString ? Date.parse(data.ExpiresString) : undefined;
      return {
        expired: expires !== undefined && !isNaN(expires) && expires < Date.now(),
        data: await streamToString(data.Body as Readable),
        lastModified: data.LastModified?.toUTCString(),
      };
    }
  } catch (e) {
    // errors ignored also not found
  }
  return { expired: true };
}

export async function deleteCacheObjects(keys: string[]) {
  const objects: ObjectIdentifier[] = keys.map((key) => {
    return { Key: key };
  });
  const response = await s3Client.send(
    new DeleteObjectsCommand({
      Bucket: getCacheBucketName(),
      Delete: {
        Objects: objects,
      },
    })
  );
  log.debug(`Deleted cache objects ${keys}: ${response.Deleted?.length}/${keys.length}`);
  if (response.Errors?.length) {
    log.error(response.Errors);
  }
}
