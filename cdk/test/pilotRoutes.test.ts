import { S3Client } from '@aws-sdk/client-s3';
import { mockClient } from 'aws-sdk-client-mock';
import { gunzip } from 'zlib';
import { handler } from '../lib/lambda/api/pilotroute-handler';
import { mockALBEvent } from './mocks';
import assert from 'assert';
import { FeatureCollection } from 'geojson';
import { RtzData } from '../lib/lambda/api/apiModels';
import { getCloudFrontCacheControlHeaders, getFeatureCacheControlHeaders } from '../lib/cache';

const s3Mock = mockClient(S3Client);
const path = 'pilotroutes';

jest.mock('../lib/lambda/environment', () => ({
  getEnvironment: () => 'mock',
  isPermanentEnvironment: () => false,
  getPilotRoutesHeaders: () => {},
}));

const pilotRoutes: RtzData[] = [
  {
    tunnus: 11,
    tila: 1,
    nimi: 'FIKMU-FIHMN (via Merikari)',
    tunniste: 'urn:mrn:stm:voyage:id:transas:15f9c10e-957f-4b49-9ec7-23bd426e15bd',
    rtz: '<?xml version="1.0" encoding="UTF-8"?>\r\n<route version="1.0" xmlns="http://www.cirm.org/RTZ/1/0">\r\n    <routeInfo routeName="FIKMU-FIHMN (via Merikari)" vesselVoyage="urn:mrn:stm:voyage:id:transas:15f9c10e-957f-4b49-9ec7-23bd426e15bd"/>\r\n    <waypoints>\r\n        <defaultWaypoint radius="0.50">\r\n            <leg portsideXTD="0.03" starboardXTD="0.03" safetyContour="8.00" safetyDepth="30.00" geometryType="Loxodrome"/>\r\n        </defaultWaypoint>\r\n        <waypoint id="14" name="FIKMU">\r\n            <position lat="60.41764100" lon="26.91951300"/>\r\n        </waypoint>\r\n        <waypoint id="13" name="Havouri">\r\n            <position lat="60.42469400" lon="26.94080000"/>\r\n        </waypoint>\r\n        <waypoint id="12" name="Lelleri">\r\n            <position lat="60.40407500" lon="26.97541800"/>\r\n        </waypoint>\r\n        <waypoint id="11" name="Hietakari">\r\n            <position lat="60.39095200" lon="26.98185600"/>\r\n        </waypoint>\r\n        <waypoint id="10" name="Retonpaasi">\r\n            <position lat="60.36196900" lon="27.01077200"/>\r\n        </waypoint>\r\n        <waypoint id="9" name="Pauhakarit">\r\n            <position lat="60.34570200" lon="27.06456900"/>\r\n        </waypoint>\r\n        <waypoint id="8" name="Merikari">\r\n            <position lat="60.34192500" lon="27.10244900"/>\r\n        </waypoint>\r\n        <waypoint id="7" name="Ahvenkari">\r\n            <position lat="60.34292600" lon="27.14653800"/>\r\n        </waypoint>\r\n        <waypoint id="6" name="Nimetön">\r\n            <position lat="60.41230400" lon="27.15217500"/>\r\n        </waypoint>\r\n        <waypoint id="5" name="Einonkari">\r\n            <position lat="60.43507400" lon="27.13656600"/>\r\n        </waypoint>\r\n        <waypoint id="4" name="Suur Musta">\r\n            <position lat="60.45834200" lon="27.14683900"/>\r\n        </waypoint>\r\n        <waypoint id="3" name="Sovinnonmatala">\r\n            <position lat="60.48080800" lon="27.13106700"/>\r\n        </waypoint>\r\n        <waypoint id="2" name="Hajaskari">\r\n            <position lat="60.50528900" lon="27.14778000"/>\r\n        </waypoint>\r\n        <waypoint id="1" name="FIHMN">\r\n            <position lat="60.51707700" lon="27.17252400"/>\r\n            <leg safetyContour="30.00"/>\r\n        </waypoint>\r\n    </waypoints>\r\n    <schedules>\r\n        <schedule id="0" name="Base Calculation"/>\r\n        <schedule id="1" name=""/>\r\n    </schedules>\r\n</route>\r\n',
    reittipisteet: [
      {
        tunnus: 97,
        nimi: 'FIKMU',
        rtzTunniste: 14,
        reittitunnus: 11,
        kaarresade: 0.5,
        geometria: {
          type: 'Point',
          coordinates: [26.919513, 60.417641],
        },
        leveysVasen: 0.03,
        leveysOikea: 0.03,
        geometriaTyyppi: 'Loxodrome',
        muutosaikaleima: '2024-01-10T11:11:37.000000+02:00',
        jarjestys: 1,
      },
      {
        tunnus: 98,
        nimi: 'Havouri',
        rtzTunniste: 13,
        reittitunnus: 11,
        kaarresade: 0.5,
        geometria: {
          type: 'Point',
          coordinates: [26.9408, 60.424694],
        },
        leveysVasen: 0.03,
        leveysOikea: 0.03,
        geometriaTyyppi: 'Loxodrome',
        muutosaikaleima: '2024-01-10T11:11:37.000000+02:00',
        jarjestys: 2,
      },
      {
        tunnus: 99,
        nimi: 'Lelleri',
        rtzTunniste: 12,
        reittitunnus: 11,
        kaarresade: 0.5,
        geometria: {
          type: 'Point',
          coordinates: [26.975418, 60.404075],
        },
        leveysVasen: 0.03,
        leveysOikea: 0.03,
        geometriaTyyppi: 'Loxodrome',
        muutosaikaleima: '2024-01-10T11:11:37.000000+02:00',
        jarjestys: 3,
      },
      {
        tunnus: 100,
        nimi: 'Hietakari',
        rtzTunniste: 11,
        reittitunnus: 11,
        kaarresade: 0.5,
        geometria: {
          type: 'Point',
          coordinates: [26.981856, 60.390952],
        },
        leveysVasen: 0.03,
        leveysOikea: 0.03,
        geometriaTyyppi: 'Loxodrome',
        muutosaikaleima: '2024-01-10T11:11:37.000000+02:00',
        jarjestys: 4,
      },
      {
        tunnus: 101,
        nimi: 'Retonpaasi',
        rtzTunniste: 10,
        reittitunnus: 11,
        kaarresade: 0.5,
        geometria: {
          type: 'Point',
          coordinates: [27.010772, 60.361969],
        },
        leveysVasen: 0.03,
        leveysOikea: 0.03,
        geometriaTyyppi: 'Loxodrome',
        muutosaikaleima: '2024-01-10T11:11:37.000000+02:00',
        jarjestys: 5,
      },
      {
        tunnus: 102,
        nimi: 'Pauhakarit',
        rtzTunniste: 9,
        reittitunnus: 11,
        kaarresade: 0.5,
        geometria: {
          type: 'Point',
          coordinates: [27.064569, 60.345702],
        },
        leveysVasen: 0.03,
        leveysOikea: 0.03,
        geometriaTyyppi: 'Loxodrome',
        muutosaikaleima: '2024-01-10T11:11:37.000000+02:00',
        jarjestys: 6,
      },
      {
        tunnus: 103,
        nimi: 'Merikari',
        rtzTunniste: 8,
        reittitunnus: 11,
        kaarresade: 0.5,
        geometria: {
          type: 'Point',
          coordinates: [27.102449, 60.341925],
        },
        leveysVasen: 0.03,
        leveysOikea: 0.03,
        geometriaTyyppi: 'Loxodrome',
        muutosaikaleima: '2024-01-10T11:11:37.000000+02:00',
        jarjestys: 7,
      },
      {
        tunnus: 104,
        nimi: 'Ahvenkari',
        rtzTunniste: 7,
        reittitunnus: 11,
        kaarresade: 0.5,
        geometria: {
          type: 'Point',
          coordinates: [27.146538, 60.342926],
        },
        leveysVasen: 0.03,
        leveysOikea: 0.03,
        geometriaTyyppi: 'Loxodrome',
        muutosaikaleima: '2024-01-10T11:11:37.000000+02:00',
        jarjestys: 8,
      },
      {
        tunnus: 105,
        nimi: 'Nimetön',
        rtzTunniste: 6,
        reittitunnus: 11,
        kaarresade: 0.5,
        geometria: {
          type: 'Point',
          coordinates: [27.152175, 60.412304],
        },
        leveysVasen: 0.03,
        leveysOikea: 0.03,
        geometriaTyyppi: 'Loxodrome',
        muutosaikaleima: '2024-01-10T11:11:37.000000+02:00',
        jarjestys: 9,
      },
      {
        tunnus: 106,
        nimi: 'Einonkari',
        rtzTunniste: 5,
        reittitunnus: 11,
        kaarresade: 0.5,
        geometria: {
          type: 'Point',
          coordinates: [27.136566, 60.435074],
        },
        leveysVasen: 0.03,
        leveysOikea: 0.03,
        geometriaTyyppi: 'Loxodrome',
        muutosaikaleima: '2024-01-10T11:11:37.000000+02:00',
        jarjestys: 10,
      },
      {
        tunnus: 107,
        nimi: 'Suur Musta',
        rtzTunniste: 4,
        reittitunnus: 11,
        kaarresade: 0.5,
        geometria: {
          type: 'Point',
          coordinates: [27.146839, 60.458342],
        },
        leveysVasen: 0.03,
        leveysOikea: 0.03,
        geometriaTyyppi: 'Loxodrome',
        muutosaikaleima: '2024-01-10T11:11:37.000000+02:00',
        jarjestys: 11,
      },
      {
        tunnus: 108,
        nimi: 'Sovinnonmatala',
        rtzTunniste: 3,
        reittitunnus: 11,
        kaarresade: 0.5,
        geometria: {
          type: 'Point',
          coordinates: [27.131067, 60.480808],
        },
        leveysVasen: 0.03,
        leveysOikea: 0.03,
        geometriaTyyppi: 'Loxodrome',
        muutosaikaleima: '2024-01-10T11:11:37.000000+02:00',
        jarjestys: 12,
      },
      {
        tunnus: 109,
        nimi: 'Hajaskari',
        rtzTunniste: 2,
        reittitunnus: 11,
        kaarresade: 0.5,
        geometria: {
          type: 'Point',
          coordinates: [27.14778, 60.505289],
        },
        leveysVasen: 0.03,
        leveysOikea: 0.03,
        geometriaTyyppi: 'Loxodrome',
        muutosaikaleima: '2024-01-10T11:11:37.000000+02:00',
        jarjestys: 13,
      },
      {
        tunnus: 110,
        nimi: 'FIHMN',
        rtzTunniste: 1,
        reittitunnus: 11,
        kaarresade: 0.5,
        geometria: {
          type: 'Point',
          coordinates: [27.172524, 60.517077],
        },
        leveysVasen: 0.03,
        leveysOikea: 0.03,
        geometriaTyyppi: 'Loxodrome',
        muutosaikaleima: '2024-01-10T11:11:37.000000+02:00',
        jarjestys: 14,
      },
    ],
  },
  {
    tunnus: 22,
    tila: 1,
    nimi: 'FIKMU-FIHMN (via Merikari)_2',
    tunniste: 'urn:mrn:stm:voyage:id:transas:15f9c10e-957f-4b49-9ec7-23bd426e15bd',
    rtz: '<?xml version="1.0" encoding="UTF-8"?>\r\n<route version="1.0" xmlns="http://www.cirm.org/RTZ/1/0">\r\n    <routeInfo routeName="FIKMU-FIHMN (via Merikari)" vesselVoyage="urn:mrn:stm:voyage:id:transas:15f9c10e-957f-4b49-9ec7-23bd426e15bd"/>\r\n    <waypoints>\r\n        <defaultWaypoint radius="0.50">\r\n            <leg portsideXTD="0.03" starboardXTD="0.03" safetyContour="8.00" safetyDepth="30.00" geometryType="Loxodrome"/>\r\n        </defaultWaypoint>\r\n        <waypoint id="14" name="FIKMU">\r\n            <position lat="60.41764100" lon="26.91951300"/>\r\n        </waypoint>\r\n        <waypoint id="13" name="Havouri">\r\n            <position lat="60.42469400" lon="26.94080000"/>\r\n        </waypoint>\r\n        <waypoint id="12" name="Lelleri">\r\n            <position lat="60.40407500" lon="26.97541800"/>\r\n        </waypoint>\r\n        <waypoint id="11" name="Hietakari">\r\n            <position lat="60.39095200" lon="26.98185600"/>\r\n        </waypoint>\r\n        <waypoint id="10" name="Retonpaasi">\r\n            <position lat="60.36196900" lon="27.01077200"/>\r\n        </waypoint>\r\n        <waypoint id="9" name="Pauhakarit">\r\n            <position lat="60.34570200" lon="27.06456900"/>\r\n        </waypoint>\r\n        <waypoint id="8" name="Merikari">\r\n            <position lat="60.34192500" lon="27.10244900"/>\r\n        </waypoint>\r\n        <waypoint id="7" name="Ahvenkari">\r\n            <position lat="60.34292600" lon="27.14653800"/>\r\n        </waypoint>\r\n        <waypoint id="6" name="Nimetön">\r\n            <position lat="60.41230400" lon="27.15217500"/>\r\n        </waypoint>\r\n        <waypoint id="5" name="Einonkari">\r\n            <position lat="60.43507400" lon="27.13656600"/>\r\n        </waypoint>\r\n        <waypoint id="4" name="Suur Musta">\r\n            <position lat="60.45834200" lon="27.14683900"/>\r\n        </waypoint>\r\n        <waypoint id="3" name="Sovinnonmatala">\r\n            <position lat="60.48080800" lon="27.13106700"/>\r\n        </waypoint>\r\n        <waypoint id="2" name="Hajaskari">\r\n            <position lat="60.50528900" lon="27.14778000"/>\r\n        </waypoint>\r\n        <waypoint id="1" name="FIHMN">\r\n            <position lat="60.51707700" lon="27.17252400"/>\r\n            <leg safetyContour="30.00"/>\r\n        </waypoint>\r\n    </waypoints>\r\n    <schedules>\r\n        <schedule id="0" name="Base Calculation"/>\r\n        <schedule id="1" name=""/>\r\n    </schedules>\r\n</route>\r\n',
    reittipisteet: [
      {
        tunnus: 197,
        nimi: 'FIKMU2',
        rtzTunniste: 24,
        reittitunnus: 21,
        kaarresade: 0.5,
        geometria: {
          type: 'Point',
          coordinates: [26.9, 60.4],
        },
        leveysVasen: 0.03,
        leveysOikea: 0.03,
        geometriaTyyppi: 'Loxodrome',
        muutosaikaleima: '2024-01-10T11:11:37.000000+02:00',
        jarjestys: 1,
      },
      {
        tunnus: 198,
        nimi: 'Havouri2',
        rtzTunniste: 23,
        reittitunnus: 21,
        kaarresade: 0.5,
        geometria: {
          type: 'Point',
          coordinates: [26.91, 60.41],
        },
        leveysVasen: 0.03,
        leveysOikea: 0.03,
        geometriaTyyppi: 'Loxodrome',
        muutosaikaleima: '2024-01-10T11:11:37.000000+02:00',
        jarjestys: 2,
      },
    ],
  },
  {
    tunnus: 33,
    tila: 1,
    nimi: 'FIKMU-FIHMN (via Merikari)_3',
    tunniste: 'urn:mrn:stm:voyage:id:transas:15f9c10e-957f-4b49-9ec7-23bd426e15bd',
    rtz: '<?xml version="1.0" encoding="UTF-8"?>\r\n<route version="1.0" xmlns="http://www.cirm.org/RTZ/1/0">\r\n    <routeInfo routeName="FIKMU-FIHMN (via Merikari)" vesselVoyage="urn:mrn:stm:voyage:id:transas:15f9c10e-957f-4b49-9ec7-23bd426e15bd"/>\r\n    <waypoints>\r\n        <defaultWaypoint radius="0.50">\r\n            <leg portsideXTD="0.03" starboardXTD="0.03" safetyContour="8.00" safetyDepth="30.00" geometryType="Loxodrome"/>\r\n        </defaultWaypoint>\r\n        <waypoint id="14" name="FIKMU">\r\n            <position lat="60.41764100" lon="26.91951300"/>\r\n        </waypoint>\r\n        <waypoint id="13" name="Havouri">\r\n            <position lat="60.42469400" lon="26.94080000"/>\r\n        </waypoint>\r\n        <waypoint id="12" name="Lelleri">\r\n            <position lat="60.40407500" lon="26.97541800"/>\r\n        </waypoint>\r\n        <waypoint id="11" name="Hietakari">\r\n            <position lat="60.39095200" lon="26.98185600"/>\r\n        </waypoint>\r\n        <waypoint id="10" name="Retonpaasi">\r\n            <position lat="60.36196900" lon="27.01077200"/>\r\n        </waypoint>\r\n        <waypoint id="9" name="Pauhakarit">\r\n            <position lat="60.34570200" lon="27.06456900"/>\r\n        </waypoint>\r\n        <waypoint id="8" name="Merikari">\r\n            <position lat="60.34192500" lon="27.10244900"/>\r\n        </waypoint>\r\n        <waypoint id="7" name="Ahvenkari">\r\n            <position lat="60.34292600" lon="27.14653800"/>\r\n        </waypoint>\r\n        <waypoint id="6" name="Nimetön">\r\n            <position lat="60.41230400" lon="27.15217500"/>\r\n        </waypoint>\r\n        <waypoint id="5" name="Einonkari">\r\n            <position lat="60.43507400" lon="27.13656600"/>\r\n        </waypoint>\r\n        <waypoint id="4" name="Suur Musta">\r\n            <position lat="60.45834200" lon="27.14683900"/>\r\n        </waypoint>\r\n        <waypoint id="3" name="Sovinnonmatala">\r\n            <position lat="60.48080800" lon="27.13106700"/>\r\n        </waypoint>\r\n        <waypoint id="2" name="Hajaskari">\r\n            <position lat="60.50528900" lon="27.14778000"/>\r\n        </waypoint>\r\n        <waypoint id="1" name="FIHMN">\r\n            <position lat="60.51707700" lon="27.17252400"/>\r\n            <leg safetyContour="30.00"/>\r\n        </waypoint>\r\n    </waypoints>\r\n    <schedules>\r\n        <schedule id="0" name="Base Calculation"/>\r\n        <schedule id="1" name=""/>\r\n    </schedules>\r\n</route>\r\n',
    reittipisteet: [
      {
        tunnus: 397,
        nimi: 'FIKMU3',
        rtzTunniste: 34,
        reittitunnus: 31,
        kaarresade: 0.5,
        geometria: {
          type: 'Point',
          coordinates: [26.93, 60.43],
        },
        leveysVasen: 0.03,
        leveysOikea: 0.03,
        geometriaTyyppi: 'Loxodrome',
        muutosaikaleima: '2024-01-10T11:11:37.000000+02:00',
        jarjestys: 1,
      },
      {
        tunnus: 398,
        nimi: 'Havour3',
        rtzTunniste: 33,
        reittitunnus: 31,
        kaarresade: 0.5,
        geometria: {
          type: 'Point',
          coordinates: [26.93, 60.43],
        },
        leveysVasen: 0.03,
        leveysOikea: 0.03,
        geometriaTyyppi: 'Loxodrome',
        muutosaikaleima: '2024-01-10T11:11:37.000000+02:00',
        jarjestys: 2,
      },
    ],
  },
];

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

let throwError = false;
jest.mock('../lib/lambda/api/axios', () => ({
  fetchPilotRoutesApi: () => {
    if (throwError) {
      throw new Error('Fetching from PILOTROUTES api failed');
    }
    return pilotRoutes;
  },
}));

beforeEach(() => {
  jest.resetAllMocks();
  s3Mock.reset();
  throwError = false;
});

it('should get pilotroutes from api', async () => {
  const response = await handler(mockALBEvent(path));
  assert(response.body);
  const responseObj = await parseResponse(response.body);
  expect(responseObj.features.length).toBe(3);
  expect(responseObj).toMatchSnapshot();
});

it('should get internal server error when api call fails', async () => {
  throwError = true;
  const response = await handler(mockALBEvent(path));
  expect(response.statusCode).toBe(503);
});

it('should return right cache headers for pilotroutes', async () => {
  const response = await handler(mockALBEvent(path));
  assert(response.body);
  const headers = getCloudFrontCacheControlHeaders('pilotroutes')?.['Cache-Control'];
  expect(response?.multiValueHeaders?.['Cache-Control']).toStrictEqual(headers);
});
