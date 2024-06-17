import { handler } from '../lib/lambda/api/aislocations-handler';
import { mockAISALBEvent } from './mocks';
import { gunzip } from 'zlib';
import assert from 'assert';
import { FeatureCollection } from 'geojson';
import { VesselLocationFeatureCollection } from '../lib/lambda/api/apiModels';
import { getAisCacheControlHeaders } from '../lib/lambda/graphql/cache';

const path = 'aislocations';

jest.mock('../lib/lambda/environment', () => ({
  getEnvironment: () => 'mock',
  isPermanentEnvironment: () => false,
  getHeaders: () => {},
}));

const locations: VesselLocationFeatureCollection = {
  type: 'FeatureCollection',
  dataUpdatedTime: '2023-10-19T07:06:13Z',
  features: [
    {
      type: 'Feature',
      mmsi: 111222000,
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
        timestampExternal: 1659212938646,
      },
    },
    {
      type: 'Feature',
      mmsi: 333444000,
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
        timestampExternal: 1638940711289,
      },
    },
    {
      type: 'Feature',
      mmsi: 55666000,
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
        timestampExternal: 1539814847556,
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
  throwError = false;
});

it('should get locations from api', async () => {
  const response = await handler(mockAISALBEvent(path));
  assert(response.body);
  const responseObj = await parseResponse(response.body);
  expect(responseObj.features.length).toBe(3);
  expect(responseObj).toMatchSnapshot();
});

it('should get internal server error when api call fails', async () => {
  throwError = true;
  const response = await handler(mockAISALBEvent(path));
  expect(response.statusCode).toBe(503);
});

it('should return right cache headers', async () => {
  const response = await handler(mockAISALBEvent(path));
  assert(response.body);
  const headers = getAisCacheControlHeaders('aislocations')?.['Cache-Control'];
  expect(response?.multiValueHeaders?.['Cache-Control']).toStrictEqual(headers);
});
