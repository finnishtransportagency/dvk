import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { handler } from '../lib/lambda/graphql/query/harbor-handler';
import HarborDBModel from '../lib/lambda/db/harborDBModel';
import { Status } from '../graphql/generated';
import { mockContext, mockQueryByIdAndStatusPublicEvent, mockQueryByIdAndVersionEvent, mockQueryByIdEvent } from './mocks';
import { ADMIN_ROLE, getOptionalCurrentUser } from '../lib/lambda/api/login';

const harbor1: HarborDBModel = {
  id: 'test',
  version: 'v0_public',
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
  id: 'test',
  version: 'v2',
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
  id: 'test',
  version: 'v0_latest',
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

const ddbMock = mockClient(DynamoDBDocumentClient);

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

jest.mock('../lib/lambda/api/login');

jest.mock('../lib/lambda/environment', () => ({
  getEnvironment: () => 'mock',
  isPermanentEnvironment: () => false,
  getHarborTableName: () => 'Harbor-mock',
}));

jest.mock('../lib/lambda/graphql/cache', () => ({
  getFromCache: () => {
    return { expired: true };
  },
  cacheResponse: () => Promise.resolve(),
}));

beforeEach(() => {
  ddbMock.reset();
  (getOptionalCurrentUser as jest.Mock).mockImplementation(() => adminUser);
});

it('should get public harbor by id from the DynamoDB', async () => {
  ddbMock
    .on(GetCommand, {
      Key: { id: 'test', version: 'v0_public' },
    })
    .resolves({
      Item: harbor1,
    });
  const response = await handler(mockQueryByIdAndStatusPublicEvent, mockContext, () => {});
  expect(response).toMatchSnapshot({
    modificationTimestamp: expect.any(Number),
    creationTimestamp: expect.any(Number),
  });
});

it('should get harbor by id and version from the DynamoDB', async () => {
  ddbMock
    .on(GetCommand, {
      Key: { id: 'test', version: 'v2' },
    })
    .resolves({
      Item: harbor2,
    });
  const response = await handler(mockQueryByIdAndVersionEvent, mockContext, () => {});
  expect(response).toMatchSnapshot({
    modificationTimestamp: expect.any(Number),
    creationTimestamp: expect.any(Number),
  });
});

it('should get latest harbor by id from the DynamoDB', async () => {
  ddbMock
    .on(GetCommand, {
      Key: { id: 'test' },
    })
    .resolves({
      Item: harbor3,
    });
  const response = await handler(mockQueryByIdEvent, mockContext, () => {});
  expect(response).toMatchSnapshot({
    modificationTimestamp: expect.any(Number),
    creationTimestamp: expect.any(Number),
  });
});

it('should get latest harbor by id from the DynamoDB when cache expired', async () => {
  ddbMock
    .on(GetCommand, {
      Key: { id: 'test', version: 'v0_latest' },
    })
    .resolves({
      Item: harbor3,
    });
  const response = await handler(mockQueryByIdEvent, mockContext, () => {});
  expect(response).toMatchSnapshot({
    modificationTimestamp: expect.any(Number),
    creationTimestamp: expect.any(Number),
  });
});

it('should get undefined when version not present', async () => {
  ddbMock
    .on(GetCommand, {
      Key: { id: 'test', version: 'v2' },
    })
    .resolves({
      Item: undefined,
    });
  const response = await handler(mockQueryByIdAndVersionEvent, mockContext, () => {});
  expect(response).toBe(undefined);
}, 60000);

it('should get public card when admin role missing', async () => {
  (getOptionalCurrentUser as jest.Mock).mockImplementation(() => otherUser);
  ddbMock
    .on(GetCommand, {
      Key: { id: 'test', version: 'v0_public' },
    })
    .resolves({
      Item: harbor1,
    });
  const response = await handler(mockQueryByIdAndStatusPublicEvent, mockContext, () => {});
  expect(response).toMatchSnapshot({
    modificationTimestamp: expect.any(Number),
    creationTimestamp: expect.any(Number),
  });
}, 60000);

it('should get undefined from version when admin role missing', async () => {
  (getOptionalCurrentUser as jest.Mock).mockImplementation(() => otherUser);
  ddbMock
    .on(GetCommand, {
      Key: { id: 'test', version: 'v2' },
    })
    .resolves({
      Item: harbor2,
    });
  const response = await handler(mockQueryByIdAndVersionEvent, mockContext, () => {});
  expect(response).toBe(undefined);
}, 60000);

it('should get undefined from latest when admin role missing', async () => {
  (getOptionalCurrentUser as jest.Mock).mockImplementation(() => otherUser);
  ddbMock
    .on(GetCommand, {
      Key: { id: 'test', version: 'v0_latest' },
    })
    .resolves({
      Item: harbor3,
    });
  const response = await handler(mockQueryByIdEvent, mockContext, () => {});
  expect(response).toBe(undefined);
}, 60000);
