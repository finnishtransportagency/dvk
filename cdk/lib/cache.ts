export type CloudFrontCacheKey =
  | 'aislocations'
  | 'aisvessels'
  | 'mareograph'
  | 'observation'
  | 'buoy'
  | 'marinewarning'
  | 'feature'
  | 'pilotroutes'
  | 'forecast';

export const FEATURE_CACHE_DURATION = 7200; // 2 hours

type CloudFrontCacheItem = {
  key: CloudFrontCacheKey;
  maxAge: number;
  staleWhileRevalidate: number;
  staleIfError: number;
};

const CloudFrontCacheItems: Array<CloudFrontCacheItem> = [
  {
    key: 'aislocations',
    maxAge: 2, // 2 seconds
    staleWhileRevalidate: 3, // 3 seconds
    staleIfError: 58, // 58 seconds (do not return location data more than 1 minute old)
  },
  {
    key: 'aisvessels',
    maxAge: 300, // 5 minutes
    staleWhileRevalidate: 60, // 1 minute
    staleIfError: 300, // 5 minutes (do not return vessel data more than 10 minutes old)
  },
  {
    key: 'mareograph',
    maxAge: 60, // 1 minute
    staleWhileRevalidate: 60, // 1 minute
    staleIfError: 12 * 3600, // 12 hours
  },
  {
    key: 'observation',
    maxAge: 60, // 1 minute
    staleWhileRevalidate: 60, // 1 minute
    staleIfError: 12 * 3600, // 12 hours
  },
  {
    key: 'buoy',
    maxAge: 60, // 1 minute
    staleWhileRevalidate: 60, // 1 minute
    staleIfError: 12 * 3600, // 12 hours
  },
  {
    key: 'marinewarning',
    maxAge: 540, // 9 minutes
    staleWhileRevalidate: 60, // 1 minute
    staleIfError: 12 * 3600, // 12 hours
  },
  {
    key: 'feature',
    maxAge: 7140, // 1 hour 59 minutes
    staleWhileRevalidate: 60, // 1 minute
    staleIfError: 12 * 3600, // 12 hours
  },
  {
    key: 'pilotroutes',
    maxAge: 7140, // 1 hour 59 minutes
    staleWhileRevalidate: 60, // 1 minute
    staleIfError: 12 * 3600, // 12 hours
  },
  {
    key: 'forecast',
    maxAge: 7140, // 1 hour 59 minutes
    staleWhileRevalidate: 60, // 1 minute
    staleIfError: 12 * 3600, // 12 hours
  },
];

export function getAisCacheControlHeaders(key: 'aisvessels' | 'aislocations'): Record<string, string[]> {
  return getCloudFrontCacheControlHeaders(key);
}

export function isCloudFrontCacheKey(key: string): key is CloudFrontCacheKey {
  return CloudFrontCacheItems.some((item) => item.key === key );
}

export function getFeatureCacheControlHeaders(): Record<string, string[]> {
  return getCloudFrontCacheControlHeaders('feature');
}

export function getCloudFrontCacheControlHeaders(key: CloudFrontCacheKey): Record<string, string[]> {
  const cacheItem = CloudFrontCacheItems.find((item) => item.key === key );
  if (!cacheItem) {
    return getFeatureCacheControlHeaders();
  }
  const maxAge = cacheItem.maxAge;
  const staleWhileRevalidate = cacheItem.staleWhileRevalidate;
  const staleIfError = cacheItem.staleIfError;

  return {
    'Cache-Control': ['max-age=' + maxAge + ', ' + 'stale-while-revalidate=' + staleWhileRevalidate + ', ' + 'stale-if-error=' + staleIfError],
  };
}
