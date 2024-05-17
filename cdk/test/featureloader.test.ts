import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { handler } from '../lib/lambda/api/featureloader-handler';
import { mockALBEvent } from './mocks';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { sdkStreamMixin } from '@smithy/util-stream';
import { pilotPlaceMap } from '../lib/lambda/db/modelMapper';
import linesCollection from './data/lines.json';
import areasCollection from './data/areas.json';
import warningsCollection from './data/warnings.json';
import vtsLinesCollection from './data/vtslines.json';
import mareographsCollection from './data/mareographs.json';
import buoysCollection from './data/buoys.json';
import harborsCollection from './data/harbors.json';
import { Readable } from 'stream';
import FairwayCardDBModel from '../lib/lambda/db/fairwayCardDBModel';
import { Status } from '../graphql/generated';
import { gunzip, gzip } from 'zlib';
import assert from 'assert';
import { FeatureCollection } from 'geojson';
import HarborDBModel from '../lib/lambda/db/harborDBModel';
import { StreamingBlobPayloadOutputTypes } from '@smithy/types';

const ddbMock = mockClient(DynamoDBDocumentClient);
const s3Mock = mockClient(S3Client);

jest.mock('../lib/lambda/environment', () => ({
  getEnvironment: () => 'mock',
  isPermanentEnvironment: () => false,
  getHeaders: () => {},
  getFairwayCardTableName: () => 'FairwayCard-mock',
  getHarborTableName: () => 'Harbor-mock',
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
    tosisuunta: 175,
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
        VOIMASSA_PAATTYY: '2023-07-13',
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

const vtsLines = {
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
  ],
};

const ilmanetXml = `
  <pointweather xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://services.weatherproof.fi/schemas/pointweather_2.00.xsd">
    <meta>
      <updated>2023-07-14T13:38:35</updated>
    </meta>
    <location id="-16777622" name="Kotka kantasatama" lat="60.472778" lon="26.945">
      <observation time="2023-07-14T09:30:00">
        <param name="InterpolatedSeaLevel" value="13"/>
        <param name="InterpolatedSeaLevelN2000" value="34"/>
      </observation>
      <observation time="2023-07-14T10:00:00">
        <param name="InterpolatedSeaLevel" value="13"/>
        <param name="InterpolatedSeaLevelN2000" value="34"/>
      </observation>
      <observation time="2023-07-14T10:30:00">
        <param name="InterpolatedSeaLevel" value="14"/>
        <param name="InterpolatedSeaLevelN2000" value="36"/>
      </observation>
      <observation time="2023-07-14T11:00:00">
        <param name="InterpolatedSeaLevel" value="16"/>
        <param name="InterpolatedSeaLevelN2000" value="37"/>
      </observation>
      <observation time="2023-07-14T11:30:00">
        <param name="InterpolatedSeaLevel" value="15"/>
        <param name="InterpolatedSeaLevelN2000" value="36"/>
      </observation>
      <observation time="2023-07-14T12:00:00">
        <param name="InterpolatedSeaLevel" value="14"/>
        <param name="InterpolatedSeaLevelN2000" value="36"/>
      </observation>
      <observation time="2023-07-14T12:30:00">
        <param name="InterpolatedSeaLevel" value="16"/>
        <param name="InterpolatedSeaLevelN2000" value="37"/>
      </observation>
      <observation time="2023-07-14T13:00:00">
        <param name="InterpolatedSeaLevel" value="15"/>
        <param name="InterpolatedSeaLevelN2000" value="36"/>
      </observation>
      <observation time="2023-07-14T13:30:00">
        <param name="InterpolatedSeaLevel" value="14"/>
        <param name="InterpolatedSeaLevelN2000" value="35"/>
      </observation>
    </location>';
  </pointweather>`;

const mareograps = [
  {
    fmisid: 134252,
    geoid: -10022821,
    latlon: '60.0318794, 20.3848209',
    station_name: 'Föglö Degerby',
    localtime: '2023-07-14 13:43:00',
    WLEV_PT1S_INSTANT: 54.0,
    WLEVN2K_PT1S_INSTANT: 166.0,
  },
  {
    fmisid: 134254,
    geoid: -10022823,
    latlon: '60.5627708, 27.1791992',
    station_name: 'Hamina Pitäjänsaari',
    localtime: '2023-07-14 13:43:00',
    WLEV_PT1S_INSTANT: 147.0,
    WLEVN2K_PT1S_INSTANT: 361.0,
  },
];

const buoys = [
  {
    fmisid: 103976,
    geoid: -103976,
    latlon: '60.1233292, 24.9724998',
    station_name: 'Helsinki Suomenlinna aaltopoiju',
    localtime: '2023-07-17 08:50:00',
    WH_PT1M_ACC: null,
    WHD_PT1M_ACC: null,
    TW_PT1M_AVG: 14.3,
  },
  {
    fmisid: 103976,
    geoid: -103976,
    latlon: '60.1233292, 24.9724998',
    station_name: 'Helsinki Suomenlinna aaltopoiju',
    localtime: '2023-07-17 08:55:00',
    WH_PT1M_ACC: 2.3,
    WHD_PT1M_ACC: 200.0,
    TW_PT1M_AVG: 15.3,
  },
  {
    fmisid: 134220,
    geoid: -10022811,
    latlon: '59.2481689, 20.9983292',
    station_name: 'Pohjois-Itämeri aaltopoiju',
    localtime: '2023-07-17 07:30:00',
    WH_PT1M_ACC: 1.3,
    WHD_PT1M_ACC: 216.0,
    TW_PT1M_AVG: 17.5,
  },
  {
    fmisid: 134221,
    geoid: -10022810,
    latlon: '59.9650002, 25.2350006',
    station_name: 'Suomenlahti aaltopoiju',
    localtime: '2023-07-17 07:30:00',
    WH_PT1M_ACC: 0.5,
    WHD_PT1M_ACC: 232.0,
    TW_PT1M_AVG: 16.6,
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
  harbors: [{ id: 'test1' }],
};

const card2: FairwayCardDBModel = {
  id: 'test2',
  name: {
    fi: 'Testfi2',
    sv: 'Testsv2',
    en: 'Testen2',
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
  harbors: [{ id: 'kaskinen' }, { id: 'test1' }],
};

const harbor: HarborDBModel = {
  id: 'test1',
  name: { fi: 'Harborfi', sv: 'Harborsv', en: 'Harboren' },
  geometry: { coordinates: [1, 2] },
};

const harbor2: HarborDBModel = {
  id: 'test2',
  name: { fi: 'Harborfi2', sv: 'Harborsv2', en: 'Harboren2' },
  geometry: { coordinates: [3, 4] },
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
      throw new Error('Fetching from VATU api failed');
    }
    if (api === 'navigointilinjat') {
      return lines;
    } else if (api === 'vaylaalueet') {
      return areas;
    }
    return [];
  },
  fetchMarineWarnings: () => {
    if (throwError) {
      throw new Error('Fetching from Pooki api failed');
    }
    return warnings;
  },
  fetchTraficomApi: () => {
    if (throwError) {
      throw new Error('Fetching from Traficom api failed');
    }
    return vtsLines;
  },
  fetchIlmanetApi: () => ilmanetXml,
  fetchWeatherApi: (path: string) => {
    if (throwError) {
      throw new Error('Fetching from Weather api failed');
    }
    if (path.includes('mareografit')) {
      return mareograps;
    } else {
      return buoys;
    }
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
  s3Mock.on(GetObjectCommand).resolves({
    Body: sdkStreamMixin(await createCacheResponse(linesCollection)) as StreamingBlobPayloadOutputTypes,
    ExpiresString: expires.toString(),
  });
  const response = await handler(mockALBEvent('line', '1,2'));
  assert(response.body);
  const responseObj = await parseResponse(response.body);
  expect(responseObj.features.length).toBe(2);
  expect(responseObj).toMatchSnapshot();
});

it('should get navigation lines from api when cache expired', async () => {
  const expires = new Date();
  expires.setTime(expires.getTime() - 1 * 60 * 60 * 1000);
  s3Mock.on(GetObjectCommand).resolves({
    Body: sdkStreamMixin(await createCacheResponse(linesCollection)) as StreamingBlobPayloadOutputTypes,
    ExpiresString: expires.toString(),
  });
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
  s3Mock.on(GetObjectCommand).resolves({
    Body: sdkStreamMixin(await createCacheResponse(linesCollection)) as StreamingBlobPayloadOutputTypes,
    ExpiresString: expires.toString(),
  });
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
  expect(response.statusCode).toBe(503);
});

it('should get bad request when invalid type', async () => {
  const response = await handler(mockALBEvent('invalid', '1,2'));
  expect(response.statusCode).toBe(400);
});

it('should get areas from cache', async () => {
  const expires = new Date();
  expires.setTime(expires.getTime() + 1 * 60 * 60 * 1000);
  s3Mock.on(GetObjectCommand).resolves({
    Body: sdkStreamMixin(await createCacheResponse(areasCollection)) as StreamingBlobPayloadOutputTypes,
    ExpiresString: expires.toString(),
  });
  const response = await handler(mockALBEvent('area', '1,2'));
  assert(response.body);
  const responseObj = await parseResponse(response.body);
  expect(responseObj.features.length).toBe(2);
  expect(responseObj).toMatchSnapshot();
});

it('should get areas from api when cache expired', async () => {
  const expires = new Date();
  expires.setTime(expires.getTime() - 1 * 60 * 60 * 1000);
  s3Mock.on(GetObjectCommand).resolves({
    Body: sdkStreamMixin(await createCacheResponse(areasCollection)) as StreamingBlobPayloadOutputTypes,
    ExpiresString: expires.toString(),
  });
  ddbMock.on(ScanCommand).resolves({
    Items: [],
  });
  const response = await handler(mockALBEvent('area', '1,2'));
  assert(response.body);
  const responseObj = await parseResponse(response.body);
  expect(responseObj.features.length).toBe(1);
  expect(responseObj).toMatchSnapshot();
});

it('should get warnings always from api when cache not expired', async () => {
  const expires = new Date();
  expires.setTime(expires.getTime() + 1 * 60 * 60 * 1000);
  s3Mock.on(GetObjectCommand).resolves({
    Body: sdkStreamMixin(await createCacheResponse(warningsCollection)) as StreamingBlobPayloadOutputTypes,
    ExpiresString: expires.toString(),
  });
  const response = await handler(mockALBEvent('marinewarning'));
  assert(response.body);
  const responseObj = await parseResponse(response.body);
  expect(responseObj.features.length).toBe(2);
  expect(responseObj).toMatchSnapshot();
});

it('should get warnings always from api when cache expired', async () => {
  const expires = new Date();
  expires.setTime(expires.getTime() - 1 * 60 * 60 * 1000);
  s3Mock.on(GetObjectCommand).resolves({
    Body: sdkStreamMixin(await createCacheResponse(warningsCollection)) as StreamingBlobPayloadOutputTypes,
    ExpiresString: expires.toString(),
  });
  const response = await handler(mockALBEvent('marinewarning'));
  assert(response.body);
  const responseObj = await parseResponse(response.body);
  expect(responseObj.features.length).toBe(2);
  expect(responseObj).toMatchSnapshot();
});

it('should get warnings from cache when api call fails', async () => {
  const expires = new Date();
  expires.setTime(expires.getTime() - 1 * 60 * 60 * 1000);
  s3Mock.on(GetObjectCommand).resolves({
    Body: sdkStreamMixin(await createCacheResponse(warningsCollection)) as StreamingBlobPayloadOutputTypes,
    ExpiresString: expires.toString(),
  });
  throwError = true;
  const response = await handler(mockALBEvent('marinewarning'));
  assert(response.body);
  const responseObj = await parseResponse(response.body);
  expect(responseObj.features.length).toBe(1);
  expect(responseObj).toMatchSnapshot();
});

it('should get vts lines from cache', async () => {
  const expires = new Date();
  expires.setTime(expires.getTime() + 1 * 60 * 60 * 1000);
  s3Mock.on(GetObjectCommand).resolves({
    Body: sdkStreamMixin(await createCacheResponse(vtsLinesCollection)) as StreamingBlobPayloadOutputTypes,
    ExpiresString: expires.toString(),
  });
  const response = await handler(mockALBEvent('vtsline'));
  assert(response.body);
  const responseObj = await parseResponse(response.body);
  expect(responseObj.features.length).toBe(2);
  expect(responseObj).toMatchSnapshot();
});

it('should get vts lines from api when cache expired', async () => {
  const expires = new Date();
  expires.setTime(expires.getTime() - 1 * 60 * 60 * 1000);
  s3Mock.on(GetObjectCommand).resolves({
    Body: sdkStreamMixin(await createCacheResponse(vtsLinesCollection)) as StreamingBlobPayloadOutputTypes,
    ExpiresString: expires.toString(),
  });
  ddbMock.on(ScanCommand).resolves({
    Items: [],
  });
  const response = await handler(mockALBEvent('vtsline'));
  assert(response.body);
  const responseObj = await parseResponse(response.body);
  expect(responseObj.features.length).toBe(1);
  expect(responseObj).toMatchSnapshot();
});

it('should get harbors from DynamoDB', async () => {
  const expires = new Date();
  expires.setTime(expires.getTime() - 1 * 60 * 60 * 1000);
  s3Mock.on(GetObjectCommand).resolves({
    Body: sdkStreamMixin(await createCacheResponse(harborsCollection)) as StreamingBlobPayloadOutputTypes,
    ExpiresString: expires.toString(),
  });
  ddbMock
    .on(ScanCommand, { TableName: 'Harbor-mock' })
    .resolves({
      Items: [harbor, harbor2],
    });
  const response = await handler(mockALBEvent('harbor'));
  assert(response.body);
  const responseObj = await parseResponse(response.body);
  expect(responseObj.features.length).toBe(2);
  expect(responseObj).toMatchSnapshot();
});

it('should get harbors from cache when DynamoDB api call fails', async () => {
  const expires = new Date();
  expires.setTime(expires.getTime() + 1 * 60 * 60 * 1000);
  s3Mock.on(GetObjectCommand).resolves({
    Body: sdkStreamMixin(await createCacheResponse(harborsCollection)) as StreamingBlobPayloadOutputTypes,
    ExpiresString: expires.toString(),
  });
  ddbMock
    .on(ScanCommand, { TableName: 'Harbor-mock' })
    .rejects();
  const response = await handler(mockALBEvent('harbor'));
  assert(response.body);
  const responseObj = await parseResponse(response.body);
  expect(responseObj.features.length).toBe(1);
  expect(responseObj).toMatchSnapshot();
});

it('should get mareographs from cache when api call fails', async () => {
  const expires = new Date();
  expires.setTime(expires.getTime() + 1 * 60 * 60 * 1000);
  s3Mock.on(GetObjectCommand).resolves({
    Body: sdkStreamMixin(await createCacheResponse(mareographsCollection)) as StreamingBlobPayloadOutputTypes,
    ExpiresString: expires.toString(),
  });
  throwError = true;
  const response = await handler(mockALBEvent('mareograph'));
  assert(response.body);
  const responseObj = await parseResponse(response.body);
  expect(responseObj.features.length).toBe(1);
  expect(responseObj).toMatchSnapshot();
});

it('should get mareographs from api', async () => {
  const expires = new Date();
  expires.setTime(expires.getTime() + 1 * 60 * 60 * 1000);
  s3Mock.on(GetObjectCommand).resolves({
    Body: sdkStreamMixin(await createCacheResponse(mareographsCollection)) as StreamingBlobPayloadOutputTypes,
    ExpiresString: expires.toString(),
  });
  const response = await handler(mockALBEvent('mareograph'));
  assert(response.body);
  const responseObj = await parseResponse(response.body);
  expect(responseObj.features.length).toBe(3);
  expect(responseObj).toMatchSnapshot();
});

it('should get buoys from cache when api call fails', async () => {
  const expires = new Date();
  expires.setTime(expires.getTime() + 1 * 60 * 60 * 1000);
  s3Mock.on(GetObjectCommand).resolves({
    Body: sdkStreamMixin(await createCacheResponse(buoysCollection)) as StreamingBlobPayloadOutputTypes,
    ExpiresString: expires.toString(),
  });
  throwError = true;
  const response = await handler(mockALBEvent('buoy'));
  assert(response.body);
  const responseObj = await parseResponse(response.body);
  expect(responseObj.features.length).toBe(2);
  expect(responseObj).toMatchSnapshot();
});

it('should get buoys from api', async () => {
  const expires = new Date();
  expires.setTime(expires.getTime() + 1 * 60 * 60 * 1000);
  s3Mock.on(GetObjectCommand).resolves({
    Body: sdkStreamMixin(await createCacheResponse(buoysCollection)) as StreamingBlobPayloadOutputTypes,
    ExpiresString: expires.toString(),
  });
  const response = await handler(mockALBEvent('buoy'));
  assert(response.body);
  const responseObj = await parseResponse(response.body);
  expect(responseObj.features.length).toBe(3);
  expect(responseObj).toMatchSnapshot();
});
