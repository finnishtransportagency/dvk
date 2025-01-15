import { DeleteObjectsCommand, GetObjectCommand, ObjectIdentifier, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Readable } from "stream";
import { log } from "./logger";
import { getEnvironment } from "./environment";
import { FEATURE_CACHE_DURATION } from "../cache";

export const TRAFICOM_CACHE_DURATION = 86400 * 3 // 3 days

const traficomS3Keys = ['prohibitionareas', 'pilotplaces'];

function getCacheBucketName() {
  return `featurecache-${getEnvironment()}`;
}

export function getFeatureCacheDuration(key: string) {
  if (traficomS3Keys.includes(key)) {
    return TRAFICOM_CACHE_DURATION;
  } else {
    return FEATURE_CACHE_DURATION;
  }
}

const s3Client = new S3Client({ region: 'eu-west-1' });

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

// delete when more sophisticated caching is implemented
// only needed to get updated starting and ending fairways for fairwaycard
// parameter left as an array just in case if more cache clearing needs arise
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