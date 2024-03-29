import { FeatureCollection, Geometry, Position } from 'geojson';
import { gzip } from 'zlib';
import { log } from './logger';
import { CacheResponse, cacheResponse, getCacheControlHeaders, getFromCache } from './graphql/cache';
import { ALBResult } from 'aws-lambda';
import { Vessel } from './api/apiModels';
import { getHeaders } from './environment';

const GEOMETRY_DECIMALS = 5;

function transform(coordinates: number[], power: number) {
  for (let i = 0, ii = coordinates.length; i < ii; ++i) {
    coordinates[i] = Math.round(coordinates[i] * power) / power;
  }
  return coordinates;
}

function transformArray(coordinates: Position[], power: number) {
  for (const position of coordinates) {
    transform(position, power);
  }
}

function transformArray2(coordinates: Position[][], power: number) {
  for (const positionArray of coordinates) {
    transformArray(positionArray, power);
  }
}

function transformArray3(coordinates: Position[][][], power: number) {
  for (const positionArray of coordinates) {
    transformArray2(positionArray, power);
  }
}

export function roundGeometry(geometry: Geometry, decimals = GEOMETRY_DECIMALS) {
  const power = Math.pow(10, decimals);
  if (geometry.type === 'Point') {
    transform(geometry.coordinates, power);
  } else if (geometry.type === 'LineString' || geometry.type === 'MultiPoint') {
    transformArray(geometry.coordinates, power);
  } else if (geometry.type === 'Polygon' || geometry.type === 'MultiLineString') {
    transformArray2(geometry.coordinates, power);
  } else if (geometry.type === 'MultiPolygon') {
    transformArray3(geometry.coordinates, power);
  } else {
    for (const geom of geometry.geometries) {
      roundGeometry(geom, decimals);
    }
  }
  return geometry;
}

export function roundDecimals(n: number | null | undefined, decimals: number) {
  const power = Math.pow(10, decimals);
  return n ? Math.round(n * power) / power : n;
}

export function invertDegrees(angle: number | null | undefined) {
  return angle ? (angle + 180) % 360 : angle;
}

export function getNumberValue(value: number | undefined): number | undefined {
  return value && value > 0 ? value : undefined;
}

export async function gzipString(input: string): Promise<Buffer> {
  const buffer = Buffer.from(input);
  return new Promise((resolve, reject) =>
    gzip(buffer, (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(data);
    })
  );
}

export async function saveResponseToS3(features: FeatureCollection | Vessel[], key: string): Promise<string> {
  let start = Date.now();
  const body = JSON.stringify(features);
  log.debug('stringify duration: %d ms', Date.now() - start);
  start = Date.now();
  const gzippedResponse = await gzipString(body);
  log.debug('gzip duration: %d ms', Date.now() - start);
  start = Date.now();
  const base64Response = gzippedResponse.toString('base64');
  log.debug('base64 duration: %d ms', Date.now() - start);
  await cacheResponse(key, base64Response);
  return base64Response;
}

export function handleLoaderError(response: CacheResponse, e: unknown): ALBResult {
  let base64Response;
  let statusCode;

  log.error('Getting features failed: %s', e);
  if (response.data) {
    log.warn('Returning possibly expired response from s3 cache');
    base64Response = response.data;
    statusCode = 200;
  } else {
    base64Response = undefined;
    statusCode = 503;
  }
  return {
    statusCode,
    body: base64Response,
  };
}

export async function handleAisCall(
  key: string,
  fetchAisData: () => Promise<FeatureCollection> | Promise<Vessel[]>,
  contentType: string[]
): Promise<ALBResult> {
  let base64Response: string | undefined;
  let statusCode = 200;
  const cacheResponse = await getFromCache(key);
  if (!cacheResponse.expired && cacheResponse.data) {
    base64Response = cacheResponse.data;
  } else {
    try {
      const aisData = await fetchAisData();
      log.debug('ais data: %d', Array.isArray(aisData) ? aisData.length : aisData.features.length);
      base64Response = await saveResponseToS3(aisData, key);
    } catch (e) {
      const errorResult = handleLoaderError(cacheResponse, e);
      base64Response = errorResult.body;
      statusCode = errorResult.statusCode;
    }
  }
  return {
    statusCode,
    body: base64Response,
    isBase64Encoded: true,
    multiValueHeaders: {
      ...getHeaders(),
      ...getCacheControlHeaders(key),
      'Content-Type': contentType,
    },
  };
}
