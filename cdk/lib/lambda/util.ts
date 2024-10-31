import { FeatureCollection, Geometry, Position } from 'geojson';
import { gzip } from 'zlib';
import { log } from './logger';
import { CacheResponse, cacheResponse, getAisCacheControlHeaders } from './graphql/cache';
import { ALBResult } from 'aws-lambda';
import { Vessel } from './api/apiModels';
import { getExpires, getHeaders } from './environment';
import FairwayCardDBModel from './db/fairwayCardDBModel';
import HarborDBModel from './db/harborDBModel';
import { Operation, Status } from '../../graphql/generated';
import { PutCommand, QueryCommand, QueryCommandInput } from '@aws-sdk/lib-dynamodb';
import { getDynamoDBDocumentClient } from './db/dynamoClient';
import { unmarshall } from '@aws-sdk/util-dynamodb';

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

export function convertToGeoJson(source: any): any {
  const features: any[] = [];
  for (let obj of source) {
    if ('geometria' in obj) {
      const { geometria, ...rem } = obj;
      features.push({ type: 'Feature', properties: rem, geometry: geometria });
    } else {
      features.push({ type: 'Feature', properties: obj });
    }
  }
  return { type: 'FeatureCollection', features: features };
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

export async function toBase64Response(features: FeatureCollection | Vessel[]): Promise<string> {
  let start = Date.now();
  const body = JSON.stringify(features);
  log.debug('stringify duration: %d ms', Date.now() - start);
  start = Date.now();
  const gzippedResponse = await gzipString(body);
  log.debug('gzip duration: %d ms', Date.now() - start);
  start = Date.now();
  const base64Response = gzippedResponse.toString('base64');
  log.debug('base64 duration: %d ms', Date.now() - start);
  return base64Response;
}

export async function saveResponseToS3(features: FeatureCollection, key: string): Promise<string> {
  const base64Response = await toBase64Response(features);
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
  try {
    const aisData = await fetchAisData();
    log.debug('ais data: %d', Array.isArray(aisData) ? aisData.length : aisData.features.length);
    base64Response = await toBase64Response(aisData);
  } catch (e) {
    base64Response = undefined;
    statusCode = 503;
  }

  return {
    statusCode,
    body: base64Response,
    isBase64Encoded: true,
    multiValueHeaders: {
      ...getHeaders(),
      ...getAisCacheControlHeaders(key),
      'Content-Type': contentType,
    },
  };
}

export function getPutCommands(
  data: FairwayCardDBModel | HarborDBModel,
  tableName: string,
  operation: Operation,
  versionNumber?: number | null,
  latestVersionNumber?: number | null,
  publicVersionData?: FairwayCardDBModel | HarborDBModel | null,
  previousVersionData?: FairwayCardDBModel | HarborDBModel
) {
  const updateCommands = [];
  // creating a new item
  if (operation === Operation.Create) {
    // latest item
    updateCommands.push(
      new PutCommand({
        TableName: tableName,
        Item: { ...data, version: 'v0_latest', latest: 1 },
        ConditionExpression: 'attribute_not_exists(id)',
      })
    );
    // set currentPublic to null and no data except id if not public
    updateCommands.push(
      new PutCommand({
        TableName: tableName,
        Item:
          data.status === Status.Public
            ? { ...data, version: 'v0_public', currentPublic: 1 }
            : { id: data.id, version: 'v0_public', currentPublic: null },
        ConditionExpression: 'attribute_not_exists(id)',
      })
    );
    updateCommands.push(
      new PutCommand({
        TableName: tableName,
        Item: { ...data, version: 'v1' },
        ConditionExpression: 'attribute_not_exists(id)',
      })
    );
  } else if (operation === Operation.Createversion) {
    // set latest version to new version
    updateCommands.push(
      new PutCommand({
        TableName: tableName,
        Item: { ...data, version: 'v0_latest', latest: versionNumber },
        ConditionExpression: 'attribute_exists(id)',
      })
    );
    updateCommands.push(
      new PutCommand({
        TableName: tableName,
        Item: { ...data, version: 'v' + versionNumber },
      })
    );
  } else if (operation === Operation.Archive) {
    const emptyData = {
      id: data.id,
      version: 'v0_public',
      currentPublic: null,
    };
    // clear public version
    updateCommands.push(
      new PutCommand({
        TableName: tableName,
        Item: emptyData,
        ConditionExpression: 'attribute_exists(id)',
      })
    );
    // save item with archived status
    updateCommands.push(
      new PutCommand({
        TableName: tableName,
        Item: { ...data },
        ConditionExpression: 'attribute_exists(id)',
      })
    );
    // update latest version pointer if necessary
    if (versionNumber === latestVersionNumber) {
      updateCommands.push(
        new PutCommand({
          TableName: tableName,
          Item: { ...data, version: 'v0_latest', latest: versionNumber },
          ConditionExpression: 'attribute_exists(id)',
        })
      );
    }
  } else if (operation === Operation.Publish) {
    // archive previous public version if exists
    if (publicVersionData) {
      updateCommands.push(
        new PutCommand({
          TableName: tableName,
          Item: { ...publicVersionData, status: Status.Archived },
          ConditionExpression: 'attribute_exists(version)',
        })
      );
    }
    // save item with public status
    updateCommands.push(
      new PutCommand({
        TableName: tableName,
        Item: { ...data },
        ConditionExpression: 'attribute_exists(id)',
      })
    );
    // set public version to new version
    updateCommands.push(
      new PutCommand({
        TableName: tableName,
        Item: { ...data, version: 'v0_public', currentPublic: versionNumber },
        ConditionExpression: 'attribute_exists(id)',
      })
    );
    // update latest version pointer if necessary
    if (versionNumber === latestVersionNumber) {
      updateCommands.push(
        new PutCommand({
          TableName: tableName,
          Item: { ...data, version: 'v0_latest', latest: versionNumber },
          ConditionExpression: 'attribute_exists(id)',
        })
      );
    }
  } else if (operation === Operation.Update) {
    updateCommands.push(
      new PutCommand({
        TableName: tableName,
        Item: { ...data },
        ConditionExpression: 'attribute_exists(id)',
      })
    );
    // update latest version pointer if necessary
    if (versionNumber === latestVersionNumber) {
      updateCommands.push(
        new PutCommand({
          TableName: tableName,
          Item: { ...data, version: 'v0_latest', latest: versionNumber },
          ConditionExpression: 'attribute_exists(id)',
        })
      );
    }
  } else if (operation === Operation.Remove) {
    updateCommands.push(
      new PutCommand({
        TableName: tableName,
        Item: { ...data },
        ConditionExpression: 'attribute_exists(id)',
      })
    );
    // if there's previous version, update latest version entry
    if (previousVersionData) {
      const previousVersionNumber = Number(previousVersionData.version.slice(1));

      updateCommands.push(
        new PutCommand({
          TableName: tableName,
          Item: { ...previousVersionData, version: 'v0_latest', latest: previousVersionNumber },
          ConditionExpression: 'attribute_exists(id)',
        })
      );
      // if there's no previous version (so only one version was left), clear latest and public data
    } else if (versionNumber === latestVersionNumber) {
      const emptyPublicData = {
        id: data.id,
        version: 'v0_public',
        currentPublic: null,
        expires: getExpires(),
      };
      const emptyLatestData = {
        id: data.id,
        version: 'v0_latest',
        latest: null,
        expires: getExpires(),
      };
      // clear public version
      updateCommands.push(
        new PutCommand({
          TableName: tableName,
          Item: emptyPublicData,
          ConditionExpression: 'attribute_exists(id)',
        })
      );
      // clear latest version
      updateCommands.push(
        new PutCommand({
          TableName: tableName,
          Item: emptyLatestData,
          ConditionExpression: 'attribute_exists(id)',
        })
      );
    }
  }

  return updateCommands;
}

export async function getPreviousVersion(tableName: string, id: string, latestVersion: number) {
  const params: QueryCommandInput = {
    TableName: tableName,
    KeyConditionExpression: '#id = :id AND #version < :latestVersion',
    FilterExpression: '#status <> :removed',
    ExpressionAttributeNames: {
      '#id': 'id',
      '#version': 'version',
      '#status': 'status',
    },
    ExpressionAttributeValues: {
      ':id': id,
      ':latestVersion': 'v' + latestVersion,
      ':removed': Status.Removed,
    },
    ScanIndexForward: false,
    Limit: 1,
  };

  try {
    const command = new QueryCommand(params);
    const result = await getDynamoDBDocumentClient().send(command);
    const previousVersion = result.Items?.[0];

    return previousVersion ? (previousVersion as FairwayCardDBModel | HarborDBModel) : undefined;
  } catch (error) {
    console.log('ERROR TULI', error);
    return undefined;
  }
}
