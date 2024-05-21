import { handler } from '../lib/lambda/api/aisvessels-handler';
import { mockAISALBEvent } from './mocks';
import { gunzip } from 'zlib';
import assert from 'assert';
import { Vessel, VesselAPIModel } from '../lib/lambda/api/apiModels';
import { getCacheControlHeaders } from '../lib/lambda/graphql/cache';

const path = 'aisvessels';

jest.mock('../lib/lambda/environment', () => ({
  getEnvironment: () => 'mock',
  isPermanentEnvironment: () => false,
  getHeaders: () => {},
}));

const vessels: VesselAPIModel[] = [
  {
    name: 'MOCK1',
    timestamp: 1650652205774,
    mmsi: 11122233001,
    callSign: 'MC001',
    imo: 7734789,
    shipType: 52,
    draught: 32,
    eta: 210112,
    posType: 1,
    referencePointA: 8,
    referencePointB: 20,
    referencePointC: 4,
    referencePointD: 4,
    destination: 'KOTKA',
  },
  {
    name: 'MOCK2',
    timestamp: 1644101972418,
    mmsi: 99988877001,
    callSign: 'MC002',
    imo: 9505508,
    shipType: 90,
    draught: 75,
    eta: 219136,
    posType: 1,
    referencePointA: 35,
    referencePointB: 63,
    referencePointC: 10,
    referencePointD: 10,
    destination: 'TURKU',
  },
  {
    name: 'MOCK3',
    timestamp: 1659503493045,
    mmsi: 66655544001,
    callSign: 'MC003',
    imo: 9684823,
    shipType: 52,
    draught: 56,
    eta: 129536,
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
  throwError = false;
});

it('should get locations from api', async () => {
  const response = await handler(mockAISALBEvent(path));
  assert(response.body);
  const responseObj = await parseResponse(response.body);
  expect(responseObj.length).toBe(3);
  expect(responseObj).toMatchSnapshot();
});

it('should get internal server error when api call fails and no cached response', async () => {
  throwError = true;
  const response = await handler(mockAISALBEvent(path));
  expect(response.statusCode).toBe(503);
});

it('should return right cache headers', async () => {
  const response = await handler(mockAISALBEvent(path));
  assert(response.body);
  const headers = getCacheControlHeaders('aisvessels')?.['Cache-Control'];
  expect(response?.multiValueHeaders?.['Cache-Control']).toStrictEqual(headers);
});
