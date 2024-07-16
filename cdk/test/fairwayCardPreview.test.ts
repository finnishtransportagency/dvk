import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { handler as previewHandler } from '../lib/lambda/graphql/query/fairwayCardPreview-handler';
import { Status } from '../graphql/generated';
import { mockContext, mockQueryByIdEvent } from './mocks';
import FairwayCardDBModel from '../lib/lambda/db/fairwayCardDBModel';
import { pilotPlaceMap } from '../lib/lambda/db/modelMapper';
import { ADMIN_ROLE, getOptionalCurrentUser } from '../lib/lambda/api/login';
import { RtzData } from '../lib/lambda/api/apiModels';
import { FeatureCollection } from 'geojson';

const ddbMock = mockClient(DynamoDBDocumentClient);

const card1: FairwayCardDBModel = {
  id: 'public',
  version: 'v0',
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
  fairways: [{ id: 1, primary: true, primarySequenceNumber: 1, secondary: false, secondarySequenceNumber: 1 }],
  trafficService: {
    pilot: {
      places: [{ id: 1, pilotJourney: 1 }],
    },
  },
  pilotRoutes: [{ id: 1 }],
};

const card2: FairwayCardDBModel = {
  id: 'draft',
  version: 'v0',
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
      places: [{ id: 2, pilotJourney: 2 }],
    },
  },
  pilotRoutes: [{ id: 2 }],
};

const card3: FairwayCardDBModel = {
  id: 'removed',
  version: 'v0',
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
      places: [{ id: 3, pilotJourney: 3 }],
    },
  },
  pilotRoutes: [{ id: 3 }],
};

const points: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [26.43, 60.28] },
      properties: { IDENTIFIER: 'FI 1', OBJNAM: 'Luotsipaikka 1' },
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [25.001, 60.21] },
      id: 'FI 2',
      properties: { IDENTIFIER: 'FI 2', OBJNAM: 'Luotsipaikka 2' },
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [25.578, 60.14] },
      id: 'FI 3',
      properties: { IDENTIFIER: 'FI 3', OBJNAM: 'Luotsipaikka 3' },
    },
  ],
};

const routes: RtzData[] = [
  {
    tunnus: 1,
    tila: 1,
    nimi: 'Reitti 1',
    tunniste: 'a',
    rtz: 'xml',
    reittipisteet: [
      {
        tunnus: 10,
        nimi: 'A',
        rtzTunniste: 10,
        reittitunnus: 10,
        kaarresade: 0.1,
        geometria: {
          type: 'Point',
          coordinates: [26.9, 60.4],
        },
        leveysVasen: 0.01,
        leveysOikea: 0.01,
        geometriaTyyppi: 'Loxodrome',
        muutosaikaleima: '2024-01-01T01:01:01.000000+02:00',
        jarjestys: 1,
      },
    ],
  },
  {
    tunnus: 2,
    tila: 1,
    nimi: 'Reitti 2',
    tunniste: 'b',
    rtz: 'xml',
    reittipisteet: [
      {
        tunnus: 20,
        nimi: 'B',
        rtzTunniste: 20,
        reittitunnus: 20,
        kaarresade: 0.2,
        geometria: {
          type: 'Point',
          coordinates: [26.9, 60.4],
        },
        leveysVasen: 0.02,
        leveysOikea: 0.02,
        geometriaTyyppi: 'Loxodrome',
        muutosaikaleima: '2024-02-02T02:02:02.000000+02:00',
        jarjestys: 1,
      },
      {
        tunnus: 21,
        nimi: 'BB',
        rtzTunniste: 21,
        reittitunnus: 21,
        kaarresade: 0.2,
        geometria: {
          type: 'Point',
          coordinates: [26.91, 60.41],
        },
        leveysVasen: 0.02,
        leveysOikea: 0.02,
        geometriaTyyppi: 'Loxodrome',
        muutosaikaleima: '2024-02-02T02:02:02.000000+02:00',
        jarjestys: 2,
      },
    ],
  },
  {
    tunnus: 3,
    tila: 1,
    nimi: 'Reitti 3',
    tunniste: 'c',
    rtz: 'xml',
    reittipisteet: [
      {
        tunnus: 30,
        nimi: 'C',
        rtzTunniste: 30,
        reittitunnus: 30,
        kaarresade: 0.3,
        geometria: {
          type: 'Point',
          coordinates: [26.93, 60.43],
        },
        leveysVasen: 0.03,
        leveysOikea: 0.03,
        geometriaTyyppi: 'Loxodrome',
        muutosaikaleima: '2024-03-03T03:03:03.000000+02:00',
        jarjestys: 1,
      },
      {
        tunnus: 31,
        nimi: 'CC',
        rtzTunniste: 31,
        reittitunnus: 31,
        kaarresade: 0.3,
        geometria: {
          type: 'Point',
          coordinates: [26.93, 60.43],
        },
        leveysVasen: 0.03,
        leveysOikea: 0.03,
        geometriaTyyppi: 'Loxodrome',
        muutosaikaleima: '2024-03-03T03:03:03.000000+02:00',
        jarjestys: 2,
      },
      {
        tunnus: 32,
        nimi: 'CCC',
        rtzTunniste: 32,
        reittitunnus: 32,
        kaarresade: 0.3,
        geometria: {
          type: 'Point',
          coordinates: [26.93, 60.43],
        },
        leveysVasen: 0.03,
        leveysOikea: 0.03,
        geometriaTyyppi: 'Loxodrome',
        muutosaikaleima: '2024-03-03T03:03:03.000000+02:00',
        jarjestys: 3,
      },
    ],
  },
];

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
  fetchPilotRoutesApi: () => routes,
}));

jest.mock('../lib/lambda/graphql/cache', () => ({
  getFromCache: () => {
    return { expired: true };
  },
  cacheResponse: () => Promise.resolve(),
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
