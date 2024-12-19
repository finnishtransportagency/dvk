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
const MAREOGRAPH_CACHE = {
  MAX_AGE: 60, // 1 minute
  STALE_WHILE_REVALIDATE: 60, // 1 minute
  STALE_IF_ERROR: 12 * 3600, // 12 hours
};
const OBSERVATION_CACHE = {
  MAX_AGE: 60, // 1 minute
  STALE_WHILE_REVALIDATE: 60, // 1 minute
  STALE_IF_ERROR: 12 * 3600, // 12 hours
};
const BUOY_CACHE = {
  MAX_AGE: 60, // 1 minute
  STALE_WHILE_REVALIDATE: 60, // 1 minute
  STALE_IF_ERROR: 12 * 3600, // 12 hours
};
const FEATURE_CACHE = {
  MAX_AGE: 7140, // 1 hour 59 minutes
  STALE_WHILE_REVALIDATE: 60, // 1 minute
  STALE_IF_ERROR: 12 * 3600, // 12 hours
};
const PILOTROUTE_CACHE = {
  MAX_AGE: 7140, // 1 hour 59 minutes
  STALE_WHILE_REVALIDATE: 60, // 1 minute
  STALE_IF_ERROR: 12 * 3600, // 12 hours
};
const MARINEWARNING_CACHE = {
  MAX_AGE: 540, // 9 minutes
  STALE_WHILE_REVALIDATE: 60, // 1 minute
  STALE_IF_ERROR: 12 * 3600, // 12 hours
};

export const FEATURE_CACHE_DURATION = 7200; // 2 hours

export const TRAFICOM_CACHE_DURATION = 86400 * 3 // 3 days

const traficomS3Keys = ['prohibitionareas', 'pilotplaces'];

function getCacheBucketName() {
  return `featurecache-${getEnvironment()}`;
}

export function getFeatureCacheDuration(key: string) {
  if (key === 'aislocations') {
    return AIS_LOCATION_CACHE.MAX_AGE;
  } else if (key === 'aisvessels') {
    return AIS_VESSEL_CACHE.MAX_AGE;
  } else if (traficomS3Keys.includes(key)) {
    return TRAFICOM_CACHE_DURATION;
  } else {
    return FEATURE_CACHE_DURATION;
  }
}

export function getAisCacheControlHeaders(key: string): Record<string, string[]> {
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

export function getFeatureCacheControlHeaders(key: string): Record<string, string[]> {
  let maxAge = FEATURE_CACHE.MAX_AGE;
  let staleWhileRevalidate = FEATURE_CACHE.STALE_WHILE_REVALIDATE;
  let staleIfError = FEATURE_CACHE.STALE_IF_ERROR;

  if (key === 'mareograph') {
    maxAge = MAREOGRAPH_CACHE.MAX_AGE;
    staleWhileRevalidate = MAREOGRAPH_CACHE.STALE_WHILE_REVALIDATE;
    staleIfError = MAREOGRAPH_CACHE.STALE_IF_ERROR;
  } else if (key === 'observation') {
    maxAge = OBSERVATION_CACHE.MAX_AGE;
    staleWhileRevalidate = OBSERVATION_CACHE.STALE_WHILE_REVALIDATE;
    staleIfError = OBSERVATION_CACHE.STALE_IF_ERROR;
  } else if (key === 'buoy') {
    maxAge = BUOY_CACHE.MAX_AGE;
    staleWhileRevalidate = BUOY_CACHE.STALE_WHILE_REVALIDATE;
    staleIfError = BUOY_CACHE.STALE_IF_ERROR;
  } else if (key === 'marinewarning') {
    maxAge = MARINEWARNING_CACHE.MAX_AGE;
    staleWhileRevalidate = MARINEWARNING_CACHE.STALE_WHILE_REVALIDATE;
    staleIfError = MARINEWARNING_CACHE.STALE_IF_ERROR;
  }

  return {
    'Cache-Control': ['max-age=' + maxAge + ', ' + 'stale-while-revalidate=' + staleWhileRevalidate + ', ' + 'stale-if-error=' + staleIfError],
  };
}

export function getPilotRouteCacheControlHeaders() {
  return {
    'Cache-Control': [
      'max-age=' +
        PILOTROUTE_CACHE.MAX_AGE +
        ', ' +
        'stale-while-revalidate=' +
        PILOTROUTE_CACHE.STALE_WHILE_REVALIDATE +
        ', ' +
        'stale-if-error=' +
        PILOTROUTE_CACHE.STALE_IF_ERROR,
    ],
  };
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
