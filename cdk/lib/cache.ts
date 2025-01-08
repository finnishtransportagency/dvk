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

export function isCloudFrontCacheKey(key: string): key is CloudFrontCacheKey {
  const cloudFrontKeys: CloudFrontCacheKey[] = ['aislocations', 'aisvessels', 'mareograph', 'observation', 'buoy', 'marinewarning', 'feature', 'pilotroutes', 'forecast'];
  return (cloudFrontKeys as string[]).includes(key);
}

export function getFeatureCacheControlHeaders(): Record<string, string[]> {
  return {
    'Cache-Control': ['max-age=' + FEATURE_CACHE.MAX_AGE + ', ' + 'stale-while-revalidate=' + FEATURE_CACHE.STALE_WHILE_REVALIDATE + ', ' + 'stale-if-error=' + FEATURE_CACHE.STALE_IF_ERROR],
  };
}

export function getCloudFrontCacheControlHeaders(key: CloudFrontCacheKey): Record<string, string[]> {
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
  } else if (key === 'pilotroutes') {
    maxAge = PILOTROUTE_CACHE.MAX_AGE;
    staleWhileRevalidate = PILOTROUTE_CACHE.STALE_WHILE_REVALIDATE;
    staleIfError = PILOTROUTE_CACHE.STALE_IF_ERROR;
  }

  return {
    'Cache-Control': ['max-age=' + maxAge + ', ' + 'stale-while-revalidate=' + staleWhileRevalidate + ', ' + 'stale-if-error=' + staleIfError],
  };
}
