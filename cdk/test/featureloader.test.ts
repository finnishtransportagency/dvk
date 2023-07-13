import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { handler } from '../lib/lambda/api/featureloader-handler';
import { mockALBEvent } from './mocks';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { pilotPlaceMap } from '../lib/lambda/db/modelMapper';
import linesCollection from './data/lines.json';
import areasCollection from './data/areas.json';
import { Readable } from 'stream';
import FairwayCardDBModel from '../lib/lambda/db/fairwayCardDBModel';
import { Status } from '../graphql/generated';
import { gunzip, gzip } from 'zlib';
import assert from 'assert';
import { FeatureCollection } from 'geojson';

const ddbMock = mockClient(DynamoDBDocumentClient);
const s3Mock = mockClient(S3Client);

jest.mock('../lib/lambda/environment', () => ({
  getFeatureCacheDurationHours: () => 2,
  getEnvironment: () => 'mock',
  isPermanentEnvironment: () => false,
  getHeaders: () => {},
}));

const lines = [
  {
    id: 69883,
    mitoitusSyvays: 1.8,
    harausSyvyys: 2.2,
    vertaustaso: 'NN+78.80',
    n2000MitoitusSyvays: null,
    n2000HarausSyvyys: null,
    n2000Vertaustaso: null,
    tosisuunta: null,
    pituus: 33,
    sade: 150,
    diaariNumero: '306/611/2000',
    vahvistusPaivamaara: '2001-01-25',
    omistaja: 'Väylävirasto',
    lisatieto: null,
    vayla: [
      {
        jnro: 4710,
        nimiFI: 'Tampere - Hämeenlinna väylä',
        nimiSV: null,
        status: 1,
        linjaus: 1,
        luokitus: 3,
      },
    ],
    tyyppiKoodi: 3,
    tyyppi: 'Pakollinen kaarre',
    geometria: {
      type: 'LineString',
      coordinates: [
        [23.771884401, 61.2984219918],
        [23.7719649967, 61.2983296353],
        [23.7720591894, 61.2982403049],
        [23.7721664917, 61.298154463],
      ],
    },
  },
];

const areas = [
  {
    id: 193273,
    nimi: null,
    mitoitusSyvays: 9.5,
    harausSyvyys: 12,
    vertaustaso: 'MW2005',
    n2000MitoitusSyvays: null,
    n2000HarausSyvyys: null,
    n2000Vertaustaso: null,
    suunta: 327,
    diaariNumero: '4424/1042/2014',
    vahvistusPaivamaara: '2014-09-19',
    omistaja: 'Väylävirasto',
    lisatieto: null,
    vayla: [
      {
        jnro: 5345,
        nimiFI: 'Loviisan väylä',
        nimiSV: 'Farleden till Lovisa',
        status: 1,
        linjaus: 1,
        vaylaLuokka: 1,
        mitoitusNopeus: null,
        mitoitusNopeus2: null,
        vaylaalueenJarjestysNro: 20,
      },
      {
        jnro: 4865,
        nimiFI: 'Etelä-Suomen talviväylä I ',
        nimiSV: 'Södra Finlands vinterfarled I',
        status: 2,
        linjaus: 1,
        vaylaLuokka: 1,
        mitoitusNopeus: null,
        mitoitusNopeus2: null,
        vaylaalueenJarjestysNro: 150,
      },
    ],
    tyyppiKoodi: 1,
    tyyppi: 'Navigointialue',
    merkintalajiKoodi: 2,
    merkintalaji: 'Kardinaali',
    liikennointiStatusKoodi: null,
    liikennointiStatus: null,
    liikennointiTyyppiKoodi: null,
    liikenteenTyyppi: null,
    liikennointiSuuntaKoodi: 2,
    liikennointiSuunta: 'Kaksisuuntainen liikenne',
    geometria: {
      type: 'Polygon',
      coordinates: [
        [
          [26.3684718529, 60.3042285176],
          [26.3747757247, 60.3006386974],
          [26.3916301723, 60.3039381049],
          [26.3838445268, 60.3072378752],
          [26.3684718529, 60.3042285176],
        ],
      ],
    },
  },
];

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
  fairways: [{ id: 4710, primary: true, secondary: false }],
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

async function createCacheResponse(collectionJson: object) {
  const collection = JSON.stringify(collectionJson);
  const zippedString = new Promise<Error | Buffer>((resolve, reject) =>
    gzip(Buffer.from(collection), (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(data);
    })
  );
  const body = new Readable();
  body.push((await zippedString).toString('base64'));
  body.push(null);
  return body;
}

let throwError = false;
jest.mock('../lib/lambda/api/axios', () => ({
  fetchVATUByApi: (api: string) => {
    if (throwError) {
      throw new Error('Fetching from api failed');
    }
    if (api === 'navigointilinjat') {
      return lines;
    } else if (api === 'vaylaalueet') {
      return areas;
    }
    return [];
  },
}));

beforeEach(() => {
  jest.resetAllMocks();
  ddbMock.reset();
  s3Mock.reset();
  pilotPlaceMap.clear();
  throwError = false;
});

it('should get navigation lines from cache', async () => {
  const expires = new Date();
  expires.setTime(expires.getTime() + 1 * 60 * 60 * 1000);
  s3Mock.on(GetObjectCommand).resolves({ Body: await createCacheResponse(linesCollection), Expires: expires });
  const response = await handler(mockALBEvent('line', '1,2'));
  assert(response.body);
  const responseObj = await parseResponse(response.body);
  expect(responseObj.features.length).toBe(2);
  expect(responseObj).toMatchSnapshot();
});

it('should get navigation lines from api when cache expired', async () => {
  const expires = new Date();
  expires.setTime(expires.getTime() - 1 * 60 * 60 * 1000);
  s3Mock.on(GetObjectCommand).resolves({ Body: await createCacheResponse(linesCollection), Expires: expires });
  ddbMock.on(ScanCommand).resolves({
    Items: [card],
  });
  const response = await handler(mockALBEvent('line', '1,2'));
  assert(response.body);
  const responseObj = await parseResponse(response.body);
  expect(responseObj.features.length).toBe(1);
  expect(responseObj).toMatchSnapshot();
});

it('should get navigation lines from cache when api call fails', async () => {
  const expires = new Date();
  expires.setTime(expires.getTime() - 1 * 60 * 60 * 1000);
  s3Mock.on(GetObjectCommand).resolves({ Body: await createCacheResponse(linesCollection), Expires: expires });
  ddbMock.on(ScanCommand).resolves({
    Items: [card],
  });
  throwError = true;
  const response = await handler(mockALBEvent('line', '1,2'));
  assert(response.body);
  const responseObj = await parseResponse(response.body);
  expect(responseObj.features.length).toBe(2);
  expect(responseObj).toMatchSnapshot();
});

it('should get internal server error when api call fails and no cached response', async () => {
  ddbMock.on(ScanCommand).resolves({
    Items: [card],
  });
  throwError = true;
  const response = await handler(mockALBEvent('line', '1,2'));
  expect(response.statusCode).toBe(500);
});

it('should get bad request when invalid type', async () => {
  const response = await handler(mockALBEvent('invalid', '1,2'));
  expect(response.statusCode).toBe(400);
});

it('should get areas from cache', async () => {
  const expires = new Date();
  expires.setTime(expires.getTime() + 1 * 60 * 60 * 1000);
  s3Mock.on(GetObjectCommand).resolves({ Body: await createCacheResponse(areasCollection), Expires: expires });
  const response = await handler(mockALBEvent('area', '1,2'));
  assert(response.body);
  const responseObj = await parseResponse(response.body);
  expect(responseObj.features.length).toBe(2);
  expect(responseObj).toMatchSnapshot();
});

it('should get areas from api when cache expired', async () => {
  const expires = new Date();
  expires.setTime(expires.getTime() - 1 * 60 * 60 * 1000);
  s3Mock.on(GetObjectCommand).resolves({ Body: await createCacheResponse(areasCollection), Expires: expires });
  ddbMock.on(ScanCommand).resolves({
    Items: [],
  });
  const response = await handler(mockALBEvent('area', '1,2'));
  assert(response.body);
  const responseObj = await parseResponse(response.body);
  expect(responseObj.features.length).toBe(1);
  expect(responseObj).toMatchSnapshot();
});
