import { mockClient } from 'aws-sdk-client-mock';
import { handler } from '../lib/lambda/graphql/query/marineWarnings-handler';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { sdkStreamMixin } from '@smithy/util-stream';
import { FeatureCollection } from 'geojson';
import { createReadStream } from 'fs';
import { StreamingBlobPayloadOutputTypes } from '@smithy/types';

const s3Mock = mockClient(S3Client);

jest.mock('../lib/lambda/environment', () => ({
  getEnvironment: () => 'mock',
  isPermanentEnvironment: () => false,
  getHeaders: () => {},
}));

const warnings: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        ID: 24822,
        ALUEET_FI: 'PERÄMERI',
        ALUEET_SV: 'BOTTENVIKEN',
        ALUEET_EN: 'BAY OF BOTHNIA',
        NUMERO: 136,
        SIJAINTI_FI: 'OULU - KEMI VÄYLÄ',
        SIJAINTI_SV: 'ULEÅBORG - KEMI FARLED',
        SIJAINTI_EN: 'OULU - KEMI FAIRWAY',
        SISALTO_FI: '\r\nREUNAMERKKI KRIISINKIVI NR 11133\r\nPAIKASSA  65-12.69N 025-04.00E\r\nEI TOIMINNASSA KORJAUSTÖIDEN VUOKSI',
        SISALTO_SV: '\r\nRANDMÄRKE KRIISINKIVI NR 11133\r\nI POS 65-12.69N 025-04.00E\r\nUR FUNKTION PÅ GRUND AV UNDERHÅLLSARBETE',
        SISALTO_EN: '\r\nEDGE MARK KRIISINKIVI NR 11133\r\nIN POS 65-12.69N 025-04.00E\r\nOUT OF ORDER DUE TO MAITENANCE WORK',
        PAIVAYS: '12.7.2023 12:00',
        TYYPPI_FI: 'LOCAL WARNING',
        TYYPPI_SV: 'LOCAL WARNING',
        TYYPPI_EN: 'LOCAL WARNING',
        VOIMASSA_ALKAA: '2023-07-12 12:00:00',
        VOIMASSA_PAATTYY: null,
        VALITTUKOHDE_TOOLTIP: 'TL:11133 Kriisinkivi, Oikeareunamerkki [Vahvistettu]',
        VIRTUAALINENTURVALAITE: 0,
        NAVTEX: 0,
        TALLENNUSPAIVA: '2023-07-12 11:48:32',
        TURVALAITE_TXT:
          'TLNUMERO:11133\r\nALALAJI:Kiinteä\r\nLAJI:Oikea\r\nTYYPPI:Reunamerkki\r\nNIMIS:Kriisinkivi\r\nVAYLAN_NIMI:Oulu - Kemi väylä\r\nTLNUMERO:11133\r\nALALAJI:Kiinteä\r\nLAJI:Oikea\r\nTYYPPI:Reunamerkki\r\nNIMIS:Kriisinkivi\r\nVAYLAN_NIMI:Oulu - Kemi väylä\r\n',
        VAYLAALUE_TXT: null,
        NAVIGOINTILINJA_TXT: null,
        ANTOPAIVA: '12.07.2023',
        TIEDOKSIANTAJA: 'FINTRAFFIC/BVTS/OFK/KD',
      },
      geometry: {
        type: 'Point',
        coordinates: [2790416.9999999967, 9625463.0051028635],
      },
    },
    {
      type: 'Feature',
      properties: {
        ID: 24803,
        ALUEET_FI: 'PERÄMERI',
        ALUEET_SV: 'BOTTENVIKEN',
        ALUEET_EN: 'BAY OF BOTHNIA',
        NUMERO: 135,
        SIJAINTI_FI: 'KEMI AJOS VÄYLÄ',
        SIJAINTI_SV: 'KEMI AJOS FARLED',
        SIJAINTI_EN: 'KEMI AJOS FAIRWAY',
        SISALTO_FI:
          '\r\nKEMIN AJOKSEN VÄYLÄLLÄ SUORITETAAN KELLUVIEN TURVALAITTEIDEN MUUTOSTÖITÄ 10.7-30.7.2023\r\n\r\nDATE AND TIME\r\n080930 UTC OF JUL',
        SISALTO_SV:
          '\r\nFÖRÄNDRINGSARBETE AV FLYTANDE NAVIGATIONS ANORDNINGAR UTFÖRS PÅ KEMI AJOS FARLED 10.7-30.7.2023\r\n\r\nDATE AND TIME\r\n080930 UTC OF JUL',
        SISALTO_EN:
          '\r\nALTERATION OF FLOATING NAVIGATIONAL AIDS ON KEMI AJOS FAIRWAY WILL BE CONDUCTED BETWEEN 10.7-30.7.2023\r\n\r\nDATE AND TIME\r\n080930 UTC OF JUL',
        PAIVAYS: '8.7.2023 12:30',
        TYYPPI_FI: 'LOCAL WARNING',
        TYYPPI_SV: 'LOCAL WARNING',
        TYYPPI_EN: 'LOCAL WARNING',
        VOIMASSA_ALKAA: '2023-07-10',
        VOIMASSA_PAATTYY: null,
        VALITTUKOHDE_TOOLTIP: null,
        VIRTUAALINENTURVALAITE: 0,
        NAVTEX: 0,
        TALLENNUSPAIVA: '2023-07-08 12:51:30',
        TURVALAITE_TXT: null,
        VAYLAALUE_TXT: null,
        NAVIGOINTILINJA_TXT: null,
        ANTOPAIVA: '08.07.2023',
        TIEDOKSIANTAJA: 'LEHTOLA/FINTRAFFIC/OFK/MMH',
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [2665506.9999999958, 9658753.0050714873],
          [2678017.0000000014, 9671869.0050591156],
          [2696213.0000000028, 9685819.0050459672],
          [2720701.0000000047, 9716222.0050173067],
          [2728618.9999999949, 9745420.00498979],
        ],
      },
    },
  ],
};

let throwError = false;
jest.mock('../lib/lambda/api/axios', () => ({
  fetchMarineWarnings: () => {
    if (throwError) {
      throw new Error('Fetching from Pooki api failed');
    }
    return { data: warnings };
  },
}));

beforeEach(() => {
  jest.resetAllMocks();
  s3Mock.reset();
  throwError = false;
});

it('should get warnings from api', async () => {
  const stream = sdkStreamMixin(createReadStream('./test/data/warningsgraphql.json')) as StreamingBlobPayloadOutputTypes;
  const expires = new Date();
  expires.setTime(expires.getTime() + 1 * 60 * 60 * 1000);
  s3Mock.on(GetObjectCommand).resolves({ Body: stream, ExpiresString: expires.toString() });
  const response = await handler();
  expect(response.length).toBe(2);
  expect(response).toMatchSnapshot();
});

it('should get warnings from cache when api call fails', async () => {
  const stream = sdkStreamMixin(createReadStream('./test/data/warningsgraphql.json')) as StreamingBlobPayloadOutputTypes;
  const expires = new Date();
  expires.setTime(expires.getTime() - 1 * 60 * 60 * 1000);
  s3Mock.on(GetObjectCommand).resolves({ Body: stream, ExpiresString: expires.toString() });
  throwError = true;
  const response = await handler();
  expect(response.length).toBe(1);
  expect(response).toMatchSnapshot();
});
