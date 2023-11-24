import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { handler } from '../lib/lambda/graphql/query/fairwayCard-handler';
import { handler as previewHandler } from '../lib/lambda/graphql/query/fairwayCardPreview-handler';
import { Status } from '../graphql/generated';
import { mockContext, mockQueryFairwayCardArgsEvent } from './mocks';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { sdkStreamMixin } from '@aws-sdk/util-stream';
import { createReadStream } from 'fs';
import FairwayCardDBModel from '../lib/lambda/db/fairwayCardDBModel';
import { pilotPlaceMap } from '../lib/lambda/db/modelMapper';
import { ADMIN_ROLE, getOptionalCurrentUser } from '../lib/lambda/api/login';

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
const card3: FairwayCardDBModel = {
  id: 'test',
  name: {
    fi: 'Testfi3',
    sv: 'Testsv3',
    en: 'Testen3',
  },
  creator: 'test3',
  creationTimestamp: Date.now(),
  modifier: 'test',
  modificationTimestamp: Date.now(),
  status: Status.Removed,
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
const adminUser = {
  uid: 'K123456',
  firstName: 'Developer',
  lastName: 'X',
  roles: [ADMIN_ROLE],
};
const otherUser = {
  uid: 'K654321',
  firstName: 'User',
  lastName: 'X',
  roles: ['DVK_Kayttaja'],
};

jest.mock('../lib/lambda/environment', () => ({
  getEnvironment: () => 'mock',
  isPermanentEnvironment: () => false,
  getFairwayCardTableName: () => 'FairwayCard-mock',
}));

jest.mock('../lib/lambda/api/axios', () => ({
  fetchTraficomApi: () => points,
}));

jest.mock('../lib/lambda/api/login');

beforeEach(() => {
  jest.resetAllMocks();
  ddbMock.reset();
  s3Mock.reset();
  pilotPlaceMap.clear();
  (getOptionalCurrentUser as jest.Mock).mockImplementation(() => adminUser);
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
  s3Mock.on(GetObjectCommand).resolves({ Body: stream, Expires: expires });
  const response = await handler(mockQueryFairwayCardArgsEvent, mockContext, () => {});
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
  s3Mock.on(GetObjectCommand).resolves({ Body: stream, Expires: expires });
  const response = await handler(mockQueryFairwayCardArgsEvent, mockContext, () => {});
  expect(response).toMatchSnapshot({
    modificationTimestamp: expect.any(Number),
    creationTimestamp: expect.any(Number),
  });
});

it('should get public card from the DynamoDB', async () => {
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
  s3Mock.on(GetObjectCommand).resolves({ Body: stream, Expires: expires });
  const response = await previewHandler(mockQueryFairwayCardArgsEvent, mockContext, () => {});
  expect(response).toMatchSnapshot({
    modificationTimestamp: expect.any(Number),
    creationTimestamp: expect.any(Number),
  });
});

it('should get draft card from the DynamoDB', async () => {
  ddbMock
    .on(GetCommand, {
      Key: { id: 'test' },
    })
    .resolves({
      Item: card2,
    });
  const stream = sdkStreamMixin(createReadStream('./test/data/pilotplaces.json'));
  const expires = new Date();
  expires.setTime(expires.getTime() + 1 * 60 * 60 * 1000);
  s3Mock.on(GetObjectCommand).resolves({ Body: stream, Expires: expires });
  const response = await previewHandler(mockQueryFairwayCardArgsEvent, mockContext, () => {});
  expect(response).toMatchSnapshot({
    modificationTimestamp: expect.any(Number),
    creationTimestamp: expect.any(Number),
  });
});

it('should filter removed card from the DynamoDB', async () => {
  ddbMock
    .on(GetCommand, {
      Key: { id: 'test' },
    })
    .resolves({
      Item: card3,
    });
  const stream = sdkStreamMixin(createReadStream('./test/data/pilotplaces.json'));
  const expires = new Date();
  expires.setTime(expires.getTime() + 1 * 60 * 60 * 1000);
  s3Mock.on(GetObjectCommand).resolves({ Body: stream, Expires: expires });
  const response = await previewHandler(mockQueryFairwayCardArgsEvent, mockContext, () => {});
  expect(response).toBe(undefined);
});

it('should return nothing when admin role missing', async () => {
  (getOptionalCurrentUser as jest.Mock).mockImplementation(() => otherUser);
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
  s3Mock.on(GetObjectCommand).resolves({ Body: stream, Expires: expires });
  const response = await previewHandler(mockQueryFairwayCardArgsEvent, mockContext, () => {});
  expect(response).toBe(undefined);
});
