import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { handler } from '../lib/lambda/graphql/query/fairwayCard-handler';
import { Status } from '../graphql/generated';
import { mockContext, mockQueryByIdEvent } from './mocks';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { sdkStreamMixin } from '@smithy/util-stream';
import { createReadStream } from 'fs';
import FairwayCardDBModel from '../lib/lambda/db/fairwayCardDBModel';
import { pilotPlaceMap } from '../lib/lambda/db/modelMapper';

const ddbMock = mockClient(DynamoDBDocumentClient);
const s3Mock = mockClient(S3Client);

const card: FairwayCardDBModel = {
  id: 'test',
  name: {
    fi: 'Testfi',
    sv: 'Testsv',
    en: 'Testen',
  },
  creator: 'test',
  creationTimestamp: Date.now(),
  modifier: 'test2',
  modificationTimestamp: Date.now(),
  status: Status.Public,
  fairways: [{ id: 1, primary: true, secondary: false }],
  trafficService: {
    pilot: {
      places: [
        {
          id: 681017200,
        },
      ],
    },
  },
};
const card2: FairwayCardDBModel = {
  id: 'test',
  name: {
    fi: 'Testfi2',
    sv: 'Testsv2',
    en: 'Testen2',
  },
  creator: 'test2',
  creationTimestamp: Date.now(),
  modifier: 'test',
  modificationTimestamp: Date.now(),
  status: Status.Draft,
  fairways: [{ id: 1, primary: true, secondary: false }],
  trafficService: {
    pilot: {
      places: [
        {
          id: 3458100305,
        },
      ],
    },
  },
};
const points = {
  features: [
    {
      type: 'Feature',
      id: 'PilotBoardingPlace_P.fid--73ae6a7c_18944e5de2b_b6',
      geometry: { type: 'Point', coordinates: [28.17, 61.5228333, 0] },
      geometry_name: 'GEOM',
      properties: {
        IDENTIFIER: 'FI 0000034581 00305',
        RWF_ID: '1410492',
        REP_ID: '2049602',
        REP_USAGE_ID: '2425332',
        CATPIL: '3',
        COMCHA: null,
        DATEND: null,
        DATSTA: null,
        INFORM: 'www.pilotorder.fi',
        NINFOM: null,
        NOBJNM: null,
        NPLDST: null,
        NTXTDS: null,
        OBJNAM: 'Puumala2',
        PEREND: null,
        PERSTA: null,
        PILDST: null,
        SORIND: 'FI,FI,reprt,NtM 24/618/2006',
        STATUS: null,
        SPATIAL_ID: null,
        SYMBOLIZATION: null,
        ACRONYM: 'PILBOP',
        PVM: '2023-07-10T06:10:39',
      },
    },
  ],
};

jest.mock('../lib/lambda/environment', () => ({
  getEnvironment: () => 'mock',
  isPermanentEnvironment: () => false,
  getFairwayCardTableName: () => 'FairwayCard-mock',
}));

jest.mock('../lib/lambda/api/axios', () => ({
  fetchTraficomApi: () => points,
}));

beforeEach(() => {
  jest.resetAllMocks();
  ddbMock.reset();
  s3Mock.reset();
  pilotPlaceMap.clear();
});

it('should get card by id from the DynamoDB', async () => {
  ddbMock
    .on(GetCommand, {
      Key: { id: 'test' },
    })
    .resolves({
      Item: card,
    });
  const stream = sdkStreamMixin(createReadStream('./test/data/pilotplaces.json'));
  const expires = new Date();
  expires.setTime(expires.getTime() + 1 * 60 * 60 * 1000);
  s3Mock
    .on(GetObjectCommand, {
      Key: 'test',
    })
    .resolves({ Body: stream, ExpiresString: expires.toString() });

  const stream2 = sdkStreamMixin(createReadStream('./test/data/pilotroutes.json'));
  const expires2 = new Date();
  expires2.setTime(expires2.getTime() + 1 * 60 * 60 * 1000);
  s3Mock
    .on(GetObjectCommand, {
      Key: 'test',
    })
    .resolves({ Body: stream2, ExpiresString: expires2.toString() });

  const response = await handler(mockQueryByIdEvent, mockContext, () => {});
  expect(response).toMatchSnapshot({
    modificationTimestamp: expect.any(Number),
    creationTimestamp: expect.any(Number),
  });
});

it('should get card by id from the DynamoDB when cache expired', async () => {
  ddbMock
    .on(GetCommand, {
      Key: { id: 'test' },
    })
    .resolves({
      Item: card2,
    });
  const stream = sdkStreamMixin(createReadStream('./test/data/pilotplaces.json'));
  const expires = new Date();
  expires.setTime(expires.getTime() - 1 * 60 * 60 * 1000);
  s3Mock
    .on(GetObjectCommand, {
      Key: 'test',
    })
    .resolves({ Body: stream, ExpiresString: expires.toString() });

  const stream2 = sdkStreamMixin(createReadStream('./test/data/pilotroutes.json'));
  const expires2 = new Date();
  expires2.setTime(expires2.getTime() + 1 * 60 * 60 * 1000);
  s3Mock
    .on(GetObjectCommand, {
      Key: 'test',
    })
    .resolves({ Body: stream2, ExpiresString: expires2.toString() });

  const response = await handler(mockQueryByIdEvent, mockContext, () => {});
  expect(response).toMatchSnapshot({
    modificationTimestamp: expect.any(Number),
    creationTimestamp: expect.any(Number),
  });
});
