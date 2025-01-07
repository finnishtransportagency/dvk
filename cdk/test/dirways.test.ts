import { mockALBEvent } from './mocks';
import { gunzip } from 'zlib';
import assert from 'assert';
import { FeatureCollection } from 'geojson';
import { DIRWAY_PATH, DIRWAY_POINT_PATH } from '../lib/lambda/api/ibnet';
import { handler } from '../lib/lambda/api/dirway-handler';
import { getFeatureCacheControlHeaders } from '../lib/cache';

const DIRWAYS_KEY = 'dirways';

jest.mock('../lib/lambda/environment', () => ({
  getEnvironment: () => 'mock',
  isPermanentEnvironment: () => false,
  getHeaders: () => {},
}));

const apiRootResponse = {
  rvEndpoints: ['icebreaker_status', 'dirwaypoint', 'location', 'dirway', 'restriction', 'source', 'aistarget', 'queue', 'activity', 'vessel'],
  toRv: 9420308526,
};

const dirwayResponse = [
  {
    rv: 7962700619,
    change_time: '2024-01-17T11:59:39.710Z',
    id: 'dirway-5_36000001',
    name: 'IBNEXT Center 0117 13:59:35',
    description: '',
  },
  {
    rv: 8845046484,
    change_time: '2024-04-18T09:25:31.446Z',
    id: 'dirway-771_36000005',
    name: 'Finnish icebreaker 1 0418 12:24:44',
    description: 'tt',
  },
  {
    rv: 7978396437,
    change_time: '2024-01-19T07:15:36.424Z',
    deleted: true,
    id: 'dirway-771_36000001',
  },
];

const dirwayPointResponse = [
  {
    rv: 7962700535,
    change_time: '2024-01-17T11:59:39.493Z',
    id: 'dirwaypoint-5_36000004',
    dirway_id: 'dirway-5_36000001',
    order_num: 2,
    name: 'wp3',
    latitude: 64.119,
    longitude: 21.5002,
  },
  {
    rv: 8845046481,
    change_time: '2024-04-18T09:25:31.241Z',
    id: 'dirwaypoint-771_36000024',
    dirway_id: 'dirway-771_36000005',
    order_num: 6,
    name: 'wp7',
    latitude: 65.1338,
    longitude: 22.266,
  },
  {
    rv: 7962700542,
    change_time: '2024-01-17T11:59:39.528Z',
    id: 'dirwaypoint-5_36000005',
    dirway_id: 'dirway-5_36000001',
    order_num: 3,
    name: 'wp4',
    latitude: 64.1813,
    longitude: 21.3712,
  },
  {
    rv: 7978396443,
    change_time: '2024-01-19T07:15:36.447Z',
    deleted: true,
    id: 'dirwaypoint-771_36000005',
    dirway_id: 'dirway-771_36000001',
  },
  {
    rv: 8845046463,
    change_time: '2024-04-18T09:25:31.196Z',
    id: 'dirwaypoint-771_36000018',
    dirway_id: 'dirway-771_36000005',
    order_num: 0,
    name: 'Nordvalen',
    latitude: 63.5254,
    longitude: 20.8039,
  },
  {
    rv: 8845046478,
    change_time: '2024-04-18T09:25:31.241Z',
    id: 'dirwaypoint-771_36000023',
    dirway_id: 'dirway-771_36000005',
    order_num: 5,
    name: 'wp6',
    latitude: 64.7053,
    longitude: 21.9253,
  },
  {
    rv: 8845046466,
    change_time: '2024-04-18T09:25:31.231Z',
    id: 'dirwaypoint-771_36000019',
    dirway_id: 'dirway-771_36000005',
    order_num: 1,
    name: 'wp2',
    latitude: 63.5645,
    longitude: 21.3041,
  },
  {
    rv: 7962700513,
    change_time: '2024-01-17T11:59:39.353Z',
    id: 'dirwaypoint-5_36000002',
    dirway_id: 'dirway-5_36000001',
    order_num: 0,
    name: 'wp1',
    latitude: 64.1058,
    longitude: 21.308,
  },
  {
    rv: 7978396440,
    change_time: '2024-01-19T07:15:36.447Z',
    deleted: true,
    id: 'dirwaypoint-771_36000006',
    dirway_id: 'dirway-771_36000001',
  },
  {
    rv: 8845046472,
    change_time: '2024-04-18T09:25:31.236Z',
    id: 'dirwaypoint-771_36000021',
    dirway_id: 'dirway-771_36000005',
    order_num: 3,
    name: 'wp4',
    latitude: 64.1216,
    longitude: 21.7054,
  },
  {
    rv: 7978396446,
    change_time: '2024-01-19T07:15:36.447Z',
    deleted: true,
    id: 'dirwaypoint-771_36000004',
    dirway_id: 'dirway-771_36000001',
  },
  {
    rv: 8845046475,
    change_time: '2024-04-18T09:25:31.236Z',
    id: 'dirwaypoint-771_36000022',
    dirway_id: 'dirway-771_36000005',
    order_num: 4,
    name: 'wp5',
    latitude: 64.4529,
    longitude: 21.9747,
  },
  {
    rv: 8845046469,
    change_time: '2024-04-18T09:25:31.231Z',
    id: 'dirwaypoint-771_36000020',
    dirway_id: 'dirway-771_36000005',
    order_num: 2,
    name: 'wp3',
    latitude: 63.7474,
    longitude: 21.7494,
  },
  {
    rv: 7962700531,
    change_time: '2024-01-17T11:59:39.483Z',
    id: 'dirwaypoint-5_36000003',
    dirway_id: 'dirway-5_36000001',
    order_num: 1,
    name: 'wp2',
    latitude: 64.0758,
    longitude: 21.3959,
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
    } else if (path === DIRWAY_PATH) {
      return dirwayResponse;
    } else if (path === DIRWAY_POINT_PATH) {
      return dirwayPointResponse;
    }
    return null;
  },
}));

beforeEach(() => {
  jest.resetAllMocks();
  throwError = false;
});

it('should get dirways from api', async () => {
  const response = await handler(mockALBEvent(DIRWAYS_KEY));
  assert(response.body);
  const responseObj = await parseResponse(response.body);
  expect(responseObj.features.length).toBe(2);
  expect(responseObj).toMatchSnapshot();
});

it('should get internal server error when api call fails', async () => {
  throwError = true;
  const response = await handler(mockALBEvent(DIRWAYS_KEY));
  expect(response.statusCode).toBe(503);
});

it('should return right cache headers', async () => {
  const response = await handler(mockALBEvent(DIRWAYS_KEY));
  assert(response.body);
  const headers = getFeatureCacheControlHeaders(DIRWAYS_KEY)?.['Cache-Control'];
  expect(response?.multiValueHeaders?.['Cache-Control']).toStrictEqual(headers);
});
