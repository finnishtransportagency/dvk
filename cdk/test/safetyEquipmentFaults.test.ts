import { mockClient } from 'aws-sdk-client-mock';
import { handler } from '../lib/lambda/graphql/query/safetyEquipmentFaults-handler';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { createReadStream } from 'fs';
import { mockVoidEvent } from './mocks';

const s3Mock = mockClient(S3Client);

jest.mock('../lib/lambda/environment', () => ({
  getFeatureCacheDurationHours: () => 2,
  getEnvironment: () => 'mock',
  isPermanentEnvironment: () => false,
  getHeaders: () => {},
}));

const faults = [
  {
    vikaId: -2139953035,
    vikatyyppiKoodi: 1022541001,
    turvalaiteNumero: 2,
    turvalaiteNimiFI: 'Kuusinen ylempi',
    turvalaiteNimiSV: 'Kuusinen övre',
    vikatyyppiFI: 'Valo pimeä',
    vikatyyppiSV: 'Ljuset slocknat',
    kirjausAika: '2020-06-07T18:33:04.711000',
    geometria: { type: 'Point', coordinates: [26.9622327773, 60.461115575] },
  },
];

let throwError = false;
jest.mock('../lib/lambda/api/axios', () => ({
  fetchVATUByApi: () => {
    if (throwError) {
      throw new Error('Fetching from VATU api failed');
    }
    return faults;
  },
}));

beforeEach(() => {
  jest.resetAllMocks();
  s3Mock.reset();
  throwError = false;
});

it('should get faults from api', async () => {
  const stream = createReadStream('./test/data/faults.json');
  const expires = new Date();
  expires.setTime(expires.getTime() + 1 * 60 * 60 * 1000);
  s3Mock.on(GetObjectCommand).resolves({ Body: stream, Expires: expires });
  const response = await handler(mockVoidEvent);
  expect(response.length).toBe(1);
  expect(response).toMatchSnapshot();
});

it('should get faults from cache when api call fails', async () => {
  const stream = createReadStream('./test/data/faults.json');
  const expires = new Date();
  expires.setTime(expires.getTime() - 1 * 60 * 60 * 1000);
  s3Mock.on(GetObjectCommand).resolves({ Body: stream, Expires: expires });
  throwError = true;
  const response = await handler(mockVoidEvent);
  expect(response.length).toBe(2);
  expect(response).toMatchSnapshot();
});
