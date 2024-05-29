import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { handler } from '../lib/lambda/graphql/query/harbors-handler';
import { AppSyncResolverEvent } from 'aws-lambda/trigger/appsync-resolver';
import HarborDBModel from '../lib/lambda/db/harborDBModel';
import { Status } from '../graphql/generated';

const ddbMock = mockClient(DynamoDBDocumentClient);

beforeEach(() => {
  ddbMock.reset();
});

jest.mock('../lib/lambda/environment', () => ({
  getEnvironment: () => 'mock',
  isPermanentEnvironment: () => false,
  getHarborTableName: () => 'Harbor-mock',
}));

it('should get harbors from the DynamoDB', async () => {
  const harbors: HarborDBModel[] = [
    {
      id: '1',
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
    },
    {
      id: '2',
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
    },
  ];
  ddbMock.on(ScanCommand).resolves({
    Items: harbors,
  });

  const response = await handler({} as AppSyncResolverEvent<void>);
  expect(response[0]).toMatchSnapshot({
    modificationTimestamp: expect.any(Number),
    creationTimestamp: expect.any(Number),
  });
  expect(response[1]).toMatchSnapshot({
    modificationTimestamp: expect.any(Number),
    creationTimestamp: expect.any(Number),
  });
});

it('should get empty harbors from the DynamoDB', async () => {
  const harbors: HarborDBModel[] = [];
  ddbMock.on(ScanCommand).resolves({
    Items: harbors,
  });
  const response = await handler({} as AppSyncResolverEvent<void>);
  expect(response.length).toBe(0);
});
