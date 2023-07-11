import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { handler } from '../lib/lambda/graphql/query/fairwayCard-handler';
import { AppSyncResolverEvent } from 'aws-lambda';
import { QueryFairwayCardArgs, Status } from '../graphql/generated';
import { context } from './mocks';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { createReadStream } from 'fs';
import FairwayCardDBModel from '../lib/lambda/db/fairwayCardDBModel';
import { pilotPlaceMap } from '../lib/lambda/db/modelMapper';

const ddbMock = mockClient(DynamoDBDocumentClient);
const s3Mock = mockClient(S3Client);

const event: AppSyncResolverEvent<QueryFairwayCardArgs> = {
  arguments: { id: 'test' },
  info: { fieldName: '', parentTypeName: '', selectionSetGraphQL: '', selectionSetList: [], variables: {} },
  prev: null,
  request: { domainName: null, headers: {} },
  source: {},
  stash: {},
};
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
const points = [
  {
    id: 3458100305,
    name: {
      fi: 'Puumala2',
      sv: 'Puumala2',
      en: 'Puumala2',
    },
    geometry: {
      type: 'Point',
      coordinates: [28.17, 61.52283],
    },
  },
];

jest.mock('../lib/lambda/environment', () => ({
  getFeatureCacheDurationHours: () => 2,
  getEnvironment: () => 'mock',
  isPermanentEnvironment: () => false,
}));

jest.mock('../lib/lambda/api/traficom', () => ({
  fetchPilotPoints: () => points,
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
  const stream = createReadStream('./test/data/pilotplaces.json');
  const expires = new Date();
  expires.setTime(expires.getTime() + 1 * 60 * 60 * 1000);
  s3Mock.on(GetObjectCommand).resolves({ Body: stream, Expires: expires });
  const response = await handler(event, context, () => {});
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
  const stream = createReadStream('./test/data/pilotplaces.json');
  const expires = new Date();
  expires.setTime(expires.getTime() - 1 * 60 * 60 * 1000);
  s3Mock.on(GetObjectCommand).resolves({ Body: stream, Expires: expires });
  const response = await handler(event, context, () => {});
  expect(response).toMatchSnapshot({
    modificationTimestamp: expect.any(Number),
    creationTimestamp: expect.any(Number),
  });
});
