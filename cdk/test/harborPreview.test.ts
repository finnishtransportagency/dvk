import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { handler as previewHandler } from '../lib/lambda/graphql/query/harborPreview-handler';
import HarborDBModel from '../lib/lambda/db/harborDBModel';
import { Status } from '../graphql/generated';
import { ADMIN_ROLE, getOptionalCurrentUser } from '../lib/lambda/api/login';
import { mockContext, mockQueryPreviewEvent } from './mocks';

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

const harbor1: HarborDBModel = {
  id: 'public',
  version: 'v1',
  name: {
    fi: 'Harbor1fi',
    sv: 'Harbor1sv',
    en: 'Harbor1en',
  },
  creator: 'test',
  creationTimestamp: Date.now(),
  modifier: 'test2',
  modificationTimestamp: Date.now(),
  n2000HeightSystem: true,
  geometry: { coordinates: [18, 62] },
  status: Status.Public,
  cargo: {
    fi: 'cargofi',
    sv: 'cargosv',
    en: 'cargoen',
  },
  company: {
    fi: 'companyfi',
    sv: 'companysv',
    en: 'companyen',
  },
  email: 'email@fi',
  extraInfo: {
    fi: 'extrafi',
    sv: 'extrasv',
    en: 'extraen',
  },
  fax: '32321',
  internet: 'www.fi',
  phoneNumber: ['12345', '22222'],
  harborBasin: {
    fi: 'basinfi',
    sv: 'basinsv',
    en: 'basinen',
  },
  quays: [
    {
      extraInfo: {
        fi: 'cargofi',
        sv: 'cargosv',
        en: 'cargoen',
      },
      name: {
        fi: 'cargofi',
        sv: 'cargosv',
        en: 'cargoen',
      },
      geometry: { coordinates: [22.1, 63.2] },
      length: 123,
      sections: [
        {
          depth: 10,
          geometry: { coordinates: [17, 62.2] },
          name: 'stest',
        },
      ],
    },
  ],
};

const harbor2: HarborDBModel = {
  id: 'draft',
  version: 'v1',
  name: {
    fi: 'Harbor2fi',
    sv: 'Harbor2sv',
    en: 'Harbor2en',
  },
  creator: 'test',
  creationTimestamp: Date.now(),
  modifier: 'test2',
  modificationTimestamp: Date.now(),
  status: Status.Draft,
};

const harbor3: HarborDBModel = {
  id: 'removed',
  version: 'v1',
  name: {
    fi: 'Harbor3fi',
    sv: 'Harbor3sv',
    en: 'Harbor3en',
  },
  creator: 'test',
  creationTimestamp: Date.now(),
  modifier: 'test3',
  modificationTimestamp: Date.now(),
  status: Status.Removed,
};

const ddbMock = mockClient(DynamoDBDocumentClient);

jest.mock('../lib/lambda/environment', () => ({
  getEnvironment: () => 'mock',
  isPermanentEnvironment: () => false,
  getHarborTableName: () => 'Harbor-mock',
}));

jest.mock('../lib/lambda/api/login');

beforeEach(() => {
  ddbMock.reset();
  (getOptionalCurrentUser as jest.Mock).mockImplementation(() => adminUser);
});

it('should get public harbor preview from the DynamoDB', async () => {
  ddbMock
    .on(GetCommand, {
      Key: { id: 'test' },
    })
    .resolves({
      Item: harbor1,
    });
  const response = await previewHandler(mockQueryPreviewEvent, mockContext, () => {});
  expect(response).toMatchSnapshot({
    modificationTimestamp: expect.any(Number),
    creationTimestamp: expect.any(Number),
  });
});

it('should get draft harbor preview from the DynamoDB', async () => {
  ddbMock
    .on(GetCommand, {
      Key: { id: 'test' },
    })
    .resolves({
      Item: harbor2,
    });
  const response = await previewHandler(mockQueryPreviewEvent, mockContext, () => {});
  expect(response).toMatchSnapshot({
    modificationTimestamp: expect.any(Number),
    creationTimestamp: expect.any(Number),
  });
});

it('should filter removed harbor preview from the DynamoDB', async () => {
  ddbMock
    .on(GetCommand, {
      Key: { id: 'test' },
    })
    .resolves({
      Item: harbor3,
    });
  const response = await previewHandler(mockQueryPreviewEvent, mockContext, () => {});
  expect(response).toBe(undefined);
});

it('should return nothing when admin role missing', async () => {
  (getOptionalCurrentUser as jest.Mock).mockImplementation(() => otherUser);
  ddbMock
    .on(GetCommand, {
      Key: { id: 'test' },
    })
    .resolves({
      Item: harbor1,
    });
  const response = await previewHandler(mockQueryPreviewEvent, mockContext, () => {});
  expect(response).toBe(undefined);
});
