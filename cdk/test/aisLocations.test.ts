import { mockClient } from 'aws-sdk-client-mock';
import { handler } from '../lib/lambda/api/aislocations-handler';
import { mockAISALBEvent } from './mocks';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { sdkStreamMixin } from '@aws-sdk/util-stream';
import locationsJson from './data/aislocations.json';
import { Readable } from 'stream';
import { gunzip, gzip } from 'zlib';
import assert from 'assert';
import { FeatureCollection } from 'geojson';

const s3Mock = mockClient(S3Client);
const path = 'aislocations';

jest.mock('../lib/lambda/environment', () => ({
  getFeatureCacheDurationHours: () => 2,
  getEnvironment: () => 'mock',
  isPermanentEnvironment: () => false,
  getHeaders: () => {},
}));

const locations: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      id: 111222000,
      geometry: {
        type: 'Point',
        coordinates: [20.85169, 55.770832],
      },
      properties: {
        mmsi: 111222000,
        sog: 0.1,
        cog: 346.5,
        navStat: 1,
        rot: 4,
        posAcc: true,
        raim: true,
        heading: 79,
        timestamp: 59,
        timestampExternal: new Date(1659212938646),
        dataUpdatedTime: '2023-10-19T07:06:13Z',
        featureType: 'aisvessel',
      },
    },
    {
      type: 'Feature',
      id: 333444000,
      geometry: {
        type: 'Point',
        coordinates: [19.612433, 59.1802],
      },
      properties: {
        mmsi: 333444000,
        sog: 6.5,
        cog: 205.7,
        navStat: 3,
        rot: 0,
        posAcc: true,
        raim: false,
        heading: 205,
        timestamp: 28,
        timestampExternal: new Date(1638940711289),
        dataUpdatedTime: '2023-10-19T07:06:13Z',
        featureType: 'aisvessel',
      },
    },
    {
      type: 'Feature',
      id: 55666000,
      geometry: {
        type: 'Point',
        coordinates: [30.190985, 59.886713],
      },
      properties: {
        mmsi: 55666000,
        sog: 5.3,
        cog: 74.9,
        navStat: 0,
        rot: 0,
        posAcc: true,
        raim: true,
        heading: 76,
        timestamp: 45,
        timestampExternal: new Date(1539814847556),
        dataUpdatedTime: '2023-10-19T07:06:13Z',
        featureType: 'aisvessel',
      },
    },
  ],
};

async function parseResponse(body: string): Promise<FeatureCollection> {
  const response = new Promise<Error | Buffer>((resolve, reject) =>
    gunzip(Buffer.from(body, 'base64'), (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(data);
    })
  );
  return JSON.parse((await response).toString()) as FeatureCollection;
}

async function createCacheResponse(collectionJson: object) {
  const collection = JSON.stringify(collectionJson);
  const zippedString = new Promise<Error | Buffer>((resolve, reject) =>
    gzip(Buffer.from(collection), (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(data);
    })
  );
  const body = new Readable();
  body.push((await zippedString).toString('base64'));
  body.push(null);
  return body;
}

let throwError = false;
jest.mock('../lib/lambda/api/axios', () => ({
  fetchAISFeatureCollection: () => {
    if (throwError) {
      throw new Error('Fetching from AIS api failed');
    }
    return locations;
  },
}));

beforeEach(() => {
  jest.resetAllMocks();
  s3Mock.reset();
  throwError = false;
});

it('should get locations from api', async () => {
  const expires = new Date();
  expires.setTime(expires.getTime() + 1 * 60 * 60 * 1000);
  s3Mock.on(GetObjectCommand).resolves({ Body: sdkStreamMixin(await createCacheResponse(locationsJson)), Expires: expires });
  const response = await handler(mockAISALBEvent(path));
  assert(response.body);
  const responseObj = await parseResponse(response.body);
  expect(responseObj.features.length).toBe(3);
  expect(responseObj).toMatchSnapshot();
});

it('should get locations from cache when api call fails', async () => {
  const expires = new Date();
  expires.setTime(expires.getTime() - 1 * 60 * 60 * 1000);
  s3Mock.on(GetObjectCommand).resolves({ Body: sdkStreamMixin(await createCacheResponse(locationsJson)), Expires: expires });
  throwError = true;
  const response = await handler(mockAISALBEvent(path));
  assert(response.body);
  const responseObj = await parseResponse(response.body);
  expect(responseObj.features.length).toBe(4);
  expect(responseObj).toMatchSnapshot();
});

it('should get internal server error when api call fails and no cached response', async () => {
  throwError = true;
  const response = await handler(mockAISALBEvent(path));
  expect(response.statusCode).toBe(500);
});
