import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { handler as previewHandler } from '../lib/lambda/graphql/query/fairwayCardPreview-handler';
import { Status } from '../graphql/generated';
import { mockContext, mockQueryByIdEvent } from './mocks';
import FairwayCardDBModel from '../lib/lambda/db/fairwayCardDBModel';
import { pilotPlaceMap } from '../lib/lambda/db/modelMapper';
import { ADMIN_ROLE, getOptionalCurrentUser } from '../lib/lambda/api/login';

const ddbMock = mockClient(DynamoDBDocumentClient);

const card1: FairwayCardDBModel = {
  id: 'public',
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
      places: [],
    },
  },
};

const card2: FairwayCardDBModel = {
  id: 'draft',
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
      places: [],
    },
  },
};

const card3: FairwayCardDBModel = {
  id: 'removed',
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
      places: [],
    },
  },
};

const points = {
  features: [],
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
  pilotPlaceMap.clear();
  (getOptionalCurrentUser as jest.Mock).mockImplementation(() => adminUser);
});

it('should get public card from the DynamoDB', async () => {
  ddbMock
    .on(GetCommand, {
      Key: { id: 'test' },
    })
    .resolves({
      Item: card1,
    });
  const response = await previewHandler(mockQueryByIdEvent, mockContext, () => {});
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
  const response = await previewHandler(mockQueryByIdEvent, mockContext, () => {});
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
  const response = await previewHandler(mockQueryByIdEvent, mockContext, () => {});
  expect(response).toBe(undefined);
});

it('should return nothing when admin role missing', async () => {
  (getOptionalCurrentUser as jest.Mock).mockImplementation(() => otherUser);
  ddbMock
    .on(GetCommand, {
      Key: { id: 'test' },
    })
    .resolves({
      Item: card1,
    });
  const response = await previewHandler(mockQueryByIdEvent, mockContext, () => {});
  expect(response).toBe(undefined);
});
