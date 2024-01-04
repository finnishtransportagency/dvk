import { mockClient } from 'aws-sdk-client-mock';
import { handler } from '../lib/lambda/api/aisvessels-handler';
import { mockAISALBEvent } from './mocks';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { sdkStreamMixin } from '@smithy/util-stream';
import vesselsJson from './data/aisvessels.json';
import { Readable } from 'stream';
import { gunzip, gzip } from 'zlib';
import assert from 'assert';
import { Vessel } from '../lib/lambda/api/apiModels';

const s3Mock = mockClient(S3Client);
const path = 'aisvessels';

jest.mock('../lib/lambda/environment', () => ({
  getEnvironment: () => 'mock',
  isPermanentEnvironment: () => false,
  getHeaders: () => {},
}));

const vessels: Vessel[] = [
  {
    name: 'MOCK1',
    timestamp: new Date(1650652205774),
    mmsi: 11122233001,
    callSign: 'MC001',
    imo: 7734789,
    shipType: 52,
    draught: 3.2,
    eta: '10-25 16:00',
    posType: 1,
    referencePointA: 8,
    referencePointB: 20,
    referencePointC: 4,
    referencePointD: 4,
    destination: 'KOTKA',
  },
  {
    name: 'MOCK2',
    timestamp: new Date(1644101972418),
    mmsi: 99988877001,
    callSign: 'MC002',
    imo: 9505508,
    shipType: 90,
    draught: 7.5,
    eta: '00-00 24:60',
    posType: 1,
    referencePointA: 35,
    referencePointB: 63,
    referencePointC: 10,
    referencePointD: 10,
    destination: 'TURKU',
  },
  {
    name: 'MOCK3',
    timestamp: new Date(1659503493045),
    mmsi: 66655544001,
    callSign: 'MC003',
    imo: 9684823,
    shipType: 52,
    draught: 5.6,
    eta: '10-19 19:00',
    posType: 3,
    referencePointA: 12,
    referencePointB: 12,
    referencePointC: 6,
    referencePointD: 5,
    destination: 'HELSINKI',
  },
];

async function parseResponse(body: string): Promise<Vessel[]> {
  const response = new Promise<Error | Buffer>((resolve, reject) =>
    gunzip(Buffer.from(body, 'base64'), (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(data);
    })
  );
  return JSON.parse((await response).toString()) as Vessel[];
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
  fetchAISMetadata: () => {
    if (throwError) {
      throw new Error('Fetching from AIS api failed');
    }
    return vessels;
  },
}));

beforeEach(() => {
  jest.resetAllMocks();
  s3Mock.reset();
  throwError = false;
});

it('should get vessels from cache', async () => {
  const expires = new Date();
  expires.setTime(expires.getTime() + 1 * 60 * 60 * 1000);
  s3Mock.on(GetObjectCommand).resolves({ Body: sdkStreamMixin(await createCacheResponse(vesselsJson)), Expires: expires });
  const response = await handler(mockAISALBEvent(path));
  assert(response.body);
  const responseObj = await parseResponse(response.body);
  expect(responseObj.length).toBe(2);
  expect(responseObj).toMatchSnapshot();
});

it('should get vessels from api when cache expired', async () => {
  const expires = new Date();
  expires.setTime(expires.getTime() - 1 * 60 * 60 * 1000);
  s3Mock.on(GetObjectCommand).resolves({ Body: sdkStreamMixin(await createCacheResponse(vesselsJson)), Expires: expires });
  const response = await handler(mockAISALBEvent(path));
  assert(response.body);
  const responseObj = await parseResponse(response.body);
  expect(responseObj.length).toBe(3);
  expect(responseObj).toMatchSnapshot();
});

it('should get vessels from cache when api call fails', async () => {
  const expires = new Date();
  expires.setTime(expires.getTime() - 1 * 60 * 60 * 1000);
  s3Mock.on(GetObjectCommand).resolves({ Body: sdkStreamMixin(await createCacheResponse(vesselsJson)), Expires: expires });
  throwError = true;
  const response = await handler(mockAISALBEvent(path));
  assert(response.body);
  const responseObj = await parseResponse(response.body);
  expect(responseObj.length).toBe(2);
  expect(responseObj).toMatchSnapshot();
});

it('should get internal server error when api call fails and no cached response', async () => {
  throwError = true;
  const response = await handler(mockAISALBEvent(path));
  expect(response.statusCode).toBe(503);
});
