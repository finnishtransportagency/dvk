import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { handler } from '../lib/lambda/graphql/query/fairwayCardLatest-handler';
import { Status } from '../graphql/generated';
import { mockContext, mockQueryLatestByIdEvent } from './mocks';
import FairwayCardDBModel from '../lib/lambda/db/fairwayCardDBModel';
import { pilotPlaceMap } from '../lib/lambda/db/modelMapper';
import { RtzData } from '../lib/lambda/api/apiModels';

const ddbMock = mockClient(DynamoDBDocumentClient);

const card: FairwayCardDBModel = {
  id: 'test',
  version: 'v0_latest',
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
  pilotRoutes: [{ id: 1 }],
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
];

jest.mock('../lib/lambda/environment', () => ({
  getEnvironment: () => 'mock',
  isPermanentEnvironment: () => false,
  getFairwayCardTableName: () => 'FairwayCard-mock',
}));

jest.mock('../lib/lambda/api/axios', () => ({
  fetchTraficomApi: () => points,
  fetchPilotRoutesApi: () => routes,
}));

beforeEach(() => {
  jest.resetAllMocks();
  ddbMock.reset();
  pilotPlaceMap.clear();
});

it('should get latest card by id from the DynamoDB', async () => {
  ddbMock
    .on(GetCommand, {
      Key: { id: 'test' },
    })
    .resolves({
      Item: card,
    });
  const response = await handler(mockQueryLatestByIdEvent, mockContext, () => {});
  expect(response).toMatchSnapshot({
    modificationTimestamp: expect.any(Number),
    creationTimestamp: expect.any(Number),
  });
});
