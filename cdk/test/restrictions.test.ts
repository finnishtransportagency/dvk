import { mockALBEvent } from './mocks';
import { gunzip } from 'zlib';
import assert from 'assert';
import { FeatureCollection } from 'geojson';
import { getFeatureCacheControlHeaders } from '../lib/lambda/graphql/cache';
import { RESTRICTIONS_KEY, handler } from '../lib/lambda/api/restriction-handler';
import { LOCATION_PATH, RESTRICTION_PATH, Restriction } from '../lib/lambda/api/ibnet';

jest.mock('../lib/lambda/environment', () => ({
  getEnvironment: () => 'mock',
  isPermanentEnvironment: () => false,
  getHeaders: () => {},
}));

const apiRootResponse = {
  rvEndpoints: ['icebreaker_status', 'dirwaypoint', 'location', 'dirway', 'restriction', 'source', 'aistarget', 'queue', 'activity', 'vessel'],
  toRv: 9420308526,
};

const locationResponse = [
  {
    rv: 7894335543,
    change_time: '2021-12-16T11:03:24.460Z',
    id: 'location-2_1041',
    type: 'PORT',
    name: 'RUNDVIK',
    locode_list: 'SERUV',
    nationality: 'SE',
    latitude: 63.5333,
    longitude: 19.45,
    winterport: true,
  },
  {
    rv: 7895851919,
    change_time: '2022-11-18T00:00:00Z',
    id: 'location-2_931',
    type: 'PORT',
    name: 'HAMINA',
    locode_list: 'FIHMN',
    nationality: 'FI',
    latitude: 60.5667,
    longitude: 27.1833,
    winterport: true,
  },
  {
    rv: 7895851919,
    change_time: '2023-12-19T00:00:00Z',
    id: 'location-2_931',
    type: 'PORT',
    name: 'HAMINA',
    locode_list: 'FIHMN',
    nationality: 'FI',
    latitude: 60.5667,
    longitude: 27.1833,
    winterport: true,
  },
  {
    rv: 7894335589,
    change_time: '2021-12-16T11:03:24.460Z',
    id: 'location-2_4081177',
    type: 'PORT',
    name: 'ORRSKÄR',
    locode_list: 'SEALA',
    nationality: 'SE',
    latitude: 61.22,
    longitude: 17.1717,
    winterport: true,
  },
  {
    rv: 7895795043,
    change_time: '2023-07-14T11:03:46.529Z',
    deleted: true,
    id: 'location-94_10004',
  },
  {
    rv: 7895851920,
    change_time: '2024-01-10T08:09:07.777Z',
    id: 'location-2_933',
    type: 'PORT',
    name: 'HANKO',
    locode_list: 'FIHKO',
    nationality: 'FI',
    latitude: 59.8167,
    longitude: 22.9667,
    winterport: true,
  },
  {
    rv: 7894335500,
    change_time: '2021-12-16T11:03:24.460Z',
    id: 'location-2_955',
    type: 'PORT',
    name: 'KANTVIK',
    locode_list: 'FIKNT',
    nationality: 'FI',
    latitude: 60.0833,
    longitude: 24.4,
    winterport: true,
  },
  {
    rv: 7894334131,
    change_time: '2021-12-16T11:03:24.460Z',
    deleted: true,
    id: 'location-94_100',
  },
  {
    rv: 7895851922,
    change_time: '2022-11-18T00:00:00Z',
    id: 'location-2_967',
    type: 'PORT',
    name: 'KASKINEN',
    locode_list: 'FIKAS',
    nationality: 'FI',
    latitude: 62.3833,
    longitude: 21.2167,
    winterport: true,
  },
  {
    rv: 7895851922,
    change_time: '2022-10-17T00:00:00Z',
    id: 'location-2_967',
    type: 'PORT',
    name: 'KASKINEN',
    locode_list: 'FIKAS',
    nationality: 'FI',
    latitude: 62.3833,
    longitude: 21.2167,
    winterport: true,
  },
  {
    rv: 7895851923,
    change_time: '2022-11-18T00:00:00Z',
    id: 'location-2_969',
    type: 'PORT',
    name: 'KEMI',
    locode_list: 'FIKEM',
    nationality: 'FI',
    latitude: 65.7333,
    longitude: 24.5667,
    winterport: true,
  },
  {
    rv: 7894334240,
    change_time: '2021-12-16T11:03:24.700Z',
    id: 'location-94_10001',
    type: 'FAIRWAY',
    name: 'OULU DW-ROUTE',
    nationality: 'FI',
    latitude: 65.2227,
    longitude: 24.674,
    winterport: true,
  },
];

const restrictionResponse = [
  {
    rv: 7895711037,
    change_time: '2023-02-27T09:16:27.067Z',
    id: 'restriction-2_35000041',
    location_id: 'location-2_1041',
    start_time: '2022-12-20T23:00:00Z',
    end_time: '2023-03-03T23:00:00Z',
    text_compilation: 'II 2000',
  },
  {
    rv: 7895711064,
    change_time: '2023-04-24T07:56:24.837Z',
    id: 'restriction-2_35000136',
    location_id: 'location-2_1041',
    start_time: '2023-03-03T23:00:00Z',
    end_time: '2023-04-23T22:00:00Z',
    text_compilation: 'I 2000',
  },
  {
    rv: 7895711080,
    change_time: '2023-05-02T07:02:55.195Z',
    id: 'restriction-2_35000178',
    location_id: 'location-2_1041',
    start_time: '2023-04-23T22:00:00Z',
    text_compilation: 'II 2000',
  },
  {
    rv: 7895711119,
    change_time: '2023-03-03T07:46:27.865Z',
    id: 'restriction-47_35000059',
    location_id: 'location-2_931',
    start_time: '2022-12-23T22:00:00Z',
    end_time: '2023-03-07T21:59:59Z',
    text_compilation: 'II 2000',
  },
  {
    rv: 7895711180,
    change_time: '2023-04-13T07:13:35.706Z',
    id: 'restriction-47_35000152',
    location_id: 'location-2_931',
    start_time: '2023-03-07T22:00:00Z',
    end_time: '2023-04-11T20:59:59Z',
    text_compilation: 'I 2000',
  },
  {
    rv: 7895711197,
    change_time: '2023-04-16T08:46:23.892Z',
    id: 'restriction-47_35000173',
    location_id: 'location-2_931',
    start_time: '2023-04-11T21:00:00Z',
    text_compilation: 'II 2000 -1',
  },
  {
    rv: 7895711066,
    change_time: '2023-04-03T07:32:47.463Z',
    id: 'restriction-2_35000138',
    location_id: 'location-2_4081177',
    start_time: '2023-03-05T23:00:00Z',
    end_time: '2023-04-02T22:00:00Z',
    text_compilation: 'II 2000',
  },
  {
    rv: 7895711161,
    change_time: '2023-04-05T07:46:32.792Z',
    id: 'restriction-47_35000105',
    location_id: 'location-2_955',
    start_time: '2023-01-06T22:00:00Z',
    end_time: '2023-04-04T21:00:00Z',
    text_compilation: 'II 2000',
  },
  {
    rv: 7895711157,
    change_time: '2023-04-12T07:29:36.860Z',
    id: 'restriction-47_35000101',
    location_id: 'location-2_967',
    start_time: '2023-01-06T22:00:00Z',
    text_compilation: 'II 2000',
  },
  {
    rv: 7895711092,
    change_time: '2022-12-19T08:25:01.995Z',
    id: 'restriction-47_35000001',
    location_id: 'location-2_969',
    start_time: '2022-11-30T22:00:00Z',
    text_compilation: 'II 2000',
  },
  {
    rv: 7895711151,
    change_time: '2023-01-27T07:24:33.406Z',
    id: 'restriction-47_35000095',
    location_id: 'location-2_969',
    start_time: '2023-01-06T22:00:00Z',
    text_compilation: 'IB 2000',
  },
  {
    rv: 7895711117,
    change_time: '2023-01-02T08:56:58.260Z',
    id: 'restriction-47_35000057',
    location_id: 'location-2_969',
    start_time: '2022-12-23T22:00:00Z',
    text_compilation: 'I 2000',
  },
  {
    rv: 7895711166,
    change_time: '2023-05-05T06:59:02.348Z',
    id: 'restriction-47_35000122',
    location_id: 'location-2_969',
    start_time: '2023-02-21T22:00:00Z',
    text_compilation: 'IA 4000',
  },
  {
    rv: 7895711163,
    change_time: '2023-02-17T08:23:36.416Z',
    id: 'restriction-47_35000114',
    location_id: 'location-2_969',
    start_time: '2023-01-31T22:00:00Z',
    text_compilation: 'IA 2000',
  },
  {
    rv: 7963559591,
    change_time: '2024-01-17T13:27:34.087Z',
    deleted: true,
    id: 'restriction-47_36000001',
  },
  {
    rv: 8744148057,
    change_time: '2024-04-08T07:58:38.719Z',
    id: 'restriction-47_36000003',
    location_id: 'location-2_969',
    start_time: '2024-01-13T22:00:00Z',
    text_compilation: 'IAS 4000',
  },
  {
    rv: 9345937317,
    change_time: '2024-05-30T08:29:26.031Z',
    id: 'restriction-47_36000037',
    location_id: 'location-94_10001',
    start_time: '2024-05-28T21:00:00Z',
    text_compilation: 'IA 3000',
  },
  {
    rv: 7895711180,
    change_time: '2023-04-12T07:13:35.706Z',
    id: 'restriction-47_35000152',
    location_id: 'location-2_931',
    start_time: '2023-03-07T22:00:00Z',
    end_time: '2023-04-11T20:59:59Z',
    text_compilation: 'I 2000 -1',
  },
  {
    rv: 7895711197,
    change_time: '2023-04-17T08:46:23.892Z',
    id: 'restriction-47_35000173',
    location_id: 'location-2_931',
    start_time: '2023-04-11T21:00:00Z',
    text_compilation: 'II 2000',
  },
  {
    rv: 7895711157,
    change_time: '2023-04-12T07:40:36.860Z',
    id: 'restriction-47_35000101',
    location_id: 'location-2_967',
    start_time: '2023-01-06T22:00:00Z',
    text_compilation: 'II 2000',
  },
];

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
  fetchIBNetApi: (path?: string) => {
    if (throwError) {
      throw new Error('Fetching from IBNet api failed');
    }
    if (!path) {
      return apiRootResponse;
    } else if (path === LOCATION_PATH) {
      return locationResponse;
    } else if (path === RESTRICTION_PATH) {
      return restrictionResponse;
    }
    return null;
  },
}));

beforeEach(() => {
  jest.resetAllMocks();
  throwError = false;
});

it('should get restrictions from api', async () => {
  const response = await handler(mockALBEvent(RESTRICTIONS_KEY));
  assert(response.body);
  const responseObj = await parseResponse(response.body);

  // 12 locations minus 8: 2 duplicates, 2 other nationalities, 2 deleted, 1 fairway, 1 without restrictions
  expect(responseObj.features.length).toBe(4);

  // Check correct duplicates are filtered
  const haminaDuplicate = responseObj.features.find((f) => f.id === 'location-2_931');
  expect(haminaDuplicate?.properties?.updated).toBe('2023-12-19T00:00:00.000Z');
  expect(haminaDuplicate?.properties?.restrictions?.length).toBe(3);
  const haminaRestrictionDuplicate = haminaDuplicate?.properties?.restrictions?.find((r: Restriction) => r.id === 'restriction-47_35000173');
  expect(haminaRestrictionDuplicate?.updated).toBe('2023-04-17T08:46:23.892Z');

  const kaskinenDuplicate = responseObj.features.find((f) => f.id === 'location-2_967');
  expect(kaskinenDuplicate?.properties?.updated).toBe('2022-11-18T00:00:00.000Z');
  expect(kaskinenDuplicate?.properties?.restrictions?.length).toBe(1);
  expect(kaskinenDuplicate?.properties?.restrictions?.[0].updated).toBe('2023-04-12T07:40:36.860Z');

  expect(responseObj).toMatchSnapshot();
});

it('should get internal server error when api call fails', async () => {
  throwError = true;
  const response = await handler(mockALBEvent(RESTRICTIONS_KEY));
  expect(response.statusCode).toBe(503);
});

it('should return right cache headers', async () => {
  const response = await handler(mockALBEvent(RESTRICTIONS_KEY));
  assert(response.body);
  const headers = getFeatureCacheControlHeaders(RESTRICTIONS_KEY)?.['Cache-Control'];
  expect(response?.multiValueHeaders?.['Cache-Control']).toStrictEqual(headers);
});
