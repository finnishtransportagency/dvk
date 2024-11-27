import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { handler } from '../lib/lambda/api/featureloader-handler';
import { mockFeaturesALBEvent } from './mocks';
import { S3Client } from '@aws-sdk/client-s3';
import { pilotPlaceMap } from '../lib/lambda/db/modelMapper';
import FairwayCardDBModel from '../lib/lambda/db/fairwayCardDBModel';
import { Status } from '../graphql/generated';
import { gunzip } from 'zlib';
import assert from 'assert';
import { FeatureCollection } from 'geojson';
import HarborDBModel from '../lib/lambda/db/harborDBModel';
import { getFeatureCacheControlHeaders } from '../lib/lambda/graphql/cache';

const ddbMock = mockClient(DynamoDBDocumentClient);
const s3Mock = mockClient(S3Client);

jest.mock('../lib/lambda/environment', () => ({
  getEnvironment: () => 'mock',
  isPermanentEnvironment: () => false,
  getHeaders: () => {},
  getWeatherResponseHeaders: () => {},
  getFairwayCardTableName: () => 'FairwayCard-mock',
  getHarborTableName: () => 'Harbor-mock',
}));

const lines = {
  features: [
    {
      properties: {
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
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [23.771884401, 61.2984219918],
          [23.7719649967, 61.2983296353],
          [23.7720591894, 61.2982403049],
          [23.7721664917, 61.298154463],
        ],
      },
    },
  ],
};

const areas = {
  features: [
    {
      properties: {
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
      },
      geometry: {
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
  ],
};

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

const forecast = [
  {
    place: '60.08,24.97:5',
    localtime: '2024-10-29 12:00:00',
    windDirection: 293.0,
    windSpeed: 5.2,
    windGust: 8.0,
    waveDirection: 232.7,
    waveHeight: 0.6,
    waveDirectionSaaristomeri: null,
    waveHeightSaaristomeri: null,
    waveDirectionHelsinki: 229.7,
    waveHeightHelsinki: 0.5,
    visibility: 40.0,
  },
  {
    place: '60.08,24.97:5',
    localtime: '2024-10-29 13:00:00',
    windDirection: 293.0,
    windSpeed: 5.2,
    windGust: 8.0,
    waveDirection: 232.7,
    waveHeight: 0.6,
    waveDirectionSaaristomeri: null,
    waveHeightSaaristomeri: null,
    waveDirectionHelsinki: 229.7,
    waveHeightHelsinki: 0.5,
    visibility: 40.0,
  },
  {
    place: '59.994667,23.995667:5',
    localtime: '2024-10-29 12:00:00',
    windDirection: 294.0,
    windSpeed: 7.4,
    windGust: 10.3,
    waveDirection: 247.4,
    waveHeight: 0.8,
    waveDirectionSaaristomeri: null,
    waveHeightSaaristomeri: null,
    waveDirectionHelsinki: null,
    waveHeightHelsinki: null,
    visibility: 40.0,
  },
  {
    place: '60.044,24.928:5',
    localtime: '2024-10-29 12:00:00',
    windDirection: 292.0,
    windSpeed: 5.1,
    windGust: 7.8,
    waveDirection: 235.8,
    waveHeight: 0.6,
    waveDirectionSaaristomeri: null,
    waveHeightSaaristomeri: null,
    waveDirectionHelsinki: 233.7,
    waveHeightHelsinki: 0.6,
    visibility: 40.0,
  },
  {
    place: '60.08,21.11:5',
    localtime: '2024-10-29 12:00:00',
    windDirection: 262.0,
    windSpeed: 5.9,
    windGust: 8.2,
    waveDirection: 277.5,
    waveHeight: 0.3,
    waveDirectionSaaristomeri: 275.7,
    waveHeightSaaristomeri: 0.3,
    waveDirectionHelsinki: null,
    waveHeightHelsinki: null,
    visibility: 40.0,
  },
];

const card: FairwayCardDBModel = {
  id: 'test',
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

const harbor: HarborDBModel = {
  id: 'test1',
  version: 'v1',
  name: { fi: 'Harborfi', sv: 'Harborsv', en: 'Harboren' },
  geometry: { coordinates: [1, 2] },
};

const harbor2: HarborDBModel = {
  id: 'test2',
  version: 'v1',
  name: { fi: 'Harborfi2', sv: 'Harborsv2', en: 'Harboren2' },
  geometry: { coordinates: [3, 4] },
};

const points = {
  features: [
    {
      type: 'Feature',
      id: 'PilotBoardingPlace_P.fid--73ae6a7c_18944e5de2b_b6',
      geometry: { type: 'Point', coordinates: [30.0, 60.0, 0] },
      geometry_name: 'GEOM',
      properties: {
        IDENTIFIER: 'FI 0000034581 00305',
      },
    },
  ],
};

const traficomN2000MapAreas = {
  type: 'FeatureCollection',
  features: [
  ]
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

async function parseWeatherResponse(body: string): Promise<FeatureCollection> {
  return JSON.parse(body.toString()) as FeatureCollection;
}

let throwError = false;
jest.mock('../lib/lambda/api/axios', () => ({
  fetchVATUByApi: (api: string) => {
    if (throwError) {
      throw new Error('Fetching from VATU api failed');
    }
    if (api === 'navigointilinjat') {
      return { data: lines };
    } else if (api === 'vaylaalueet') {
      return { data: areas };
    }
    return [];
  },
  fetchMarineWarnings: () => {
    if (throwError) {
      throw new Error('Fetching from Pooki api failed');
    }
    return {
      data: warnings,
      headers: {
        date: 0,
      },
    };
  },
  fetchTraficomApi: (path: string) => {
    if (throwError) {
      throw new Error('Fetching from Traficom api failed');
    }
    if (path.includes('avoin:tuotejako_kaikki')) {
      return traficomN2000MapAreas;
    }
    return path.includes('PilotBoardingPlace') ? points : vtsLines;
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
  fetchWeatherApiResponse: () => {
    if (throwError) {
      throw new Error('Fetching from Weather forecast api failed');
    }
    return {
      data: forecast,
      headers: {
        date: 0,
      },
    };
  },
}));

beforeEach(() => {
  jest.resetAllMocks();
  ddbMock.reset();
  s3Mock.reset();
  pilotPlaceMap.clear();
  throwError = false;
});

it('should get navigation lines from api', async () => {
  ddbMock.on(ScanCommand).resolves({
    Items: [card],
  });
  const response = await handler(mockFeaturesALBEvent('line', '1,2'));
  assert(response.body);
  const responseObj = await parseResponse(response.body);
  expect(responseObj.features.length).toBe(1);
  expect(responseObj).toMatchSnapshot();
});

it('should get internal server error when api call fails', async () => {
  ddbMock.on(ScanCommand).resolves({
    Items: [card],
  });
  throwError = true;
  const response = await handler(mockFeaturesALBEvent('line', '1,2'));
  expect(response.statusCode).toBe(503);
});

it('should get bad request when invalid type', async () => {
  const response = await handler(mockFeaturesALBEvent('invalid', '1,2'));
  expect(response.statusCode).toBe(400);
});

it('should get areas from api', async () => {
  ddbMock.on(ScanCommand).resolves({
    Items: [],
  });
  const response = await handler(mockFeaturesALBEvent('area', '1,2'));
  assert(response.body);
  const responseObj = await parseResponse(response.body);
  expect(responseObj.features.length).toBe(1);
  expect(responseObj).toMatchSnapshot();
});

it('should get warnings always from api', async () => {
  const response = await handler(mockFeaturesALBEvent('marinewarning'));
  assert(response.body);
  const responseObj = await parseResponse(response.body);
  expect(responseObj.features.length).toBe(2);
  expect(responseObj).toMatchSnapshot();
});

it('should get vts lines from api', async () => {
  const response = await handler(mockFeaturesALBEvent('vtsline'));
  assert(response.body);
  const responseObj = await parseResponse(response.body);
  expect(responseObj.features.length).toBe(1);
  expect(responseObj).toMatchSnapshot();
});

it('should get harbors from DynamoDB', async () => {
  ddbMock.on(ScanCommand, { TableName: 'Harbor-mock' }).resolves({ Items: [harbor, harbor2] });
  const response = await handler(mockFeaturesALBEvent('harbor'));
  assert(response.body);
  const responseObj = await parseResponse(response.body);
  expect(responseObj.features.length).toBe(2);
  expect(responseObj).toMatchSnapshot();
});

it('should get mareographs from api', async () => {
  const response = await handler(mockFeaturesALBEvent('mareograph'));
  assert(response.body);
  const responseObj = await parseWeatherResponse(response.body);
  expect(responseObj.features.length).toBe(3);
  expect(responseObj).toMatchSnapshot();
});

it('should get buoys from api', async () => {
  const response = await handler(mockFeaturesALBEvent('buoy'));
  assert(response.body);
  const responseObj = await parseWeatherResponse(response.body);
  expect(responseObj.features.length).toBe(3);
  expect(responseObj).toMatchSnapshot();
});

it('should return right cache headers for buoy', async () => {
  const response = await handler(mockFeaturesALBEvent('buoy'));
  assert(response.body);
  const headers = getFeatureCacheControlHeaders('buoy')?.['Cache-Control'];
  expect(response?.multiValueHeaders?.['Cache-Control']).toStrictEqual(headers);
});

it('should return right cache headers for mareograph', async () => {
  const response = await handler(mockFeaturesALBEvent('mareograph'));
  assert(response.body);
  const headers = getFeatureCacheControlHeaders('mareograph')?.['Cache-Control'];
  expect(response?.multiValueHeaders?.['Cache-Control']).toStrictEqual(headers);
});

it('should return right cache headers for observation', async () => {
  const response = await handler(mockFeaturesALBEvent('observation'));
  assert(response.body);
  const headers = getFeatureCacheControlHeaders('observation')?.['Cache-Control'];
  expect(response?.multiValueHeaders?.['Cache-Control']).toStrictEqual(headers);
});

it('should get weather and wave forecast from api', async () => {
  const response = await handler(mockFeaturesALBEvent('forecast'));
  assert(response.body);
  const responseObj = await parseWeatherResponse(response.body);
  expect(responseObj.features.length).toBe(4);

  //2 items should be grouped using the generated id
  expect(responseObj.features.find((f) => f.id == '60.08,24.97')?.properties?.forecastItems.length).toBe(2);

  //Check that for Helsinki coords, the wave direction uses the more accurate version
  expect(responseObj.features.find((f) => f.id == '60.08,24.97')?.properties?.forecastItems[0].waveDirection).toBe(229.7);
  expect(responseObj.features.find((f) => f.id == '60.08,24.97')?.properties?.forecastItems[0].waveHeight).toBe(0.5);

  //Check that for Saaristomeri coords, the wave direction uses the more accurate version
  expect(responseObj.features.find((f) => f.id == '60.08,21.11')?.properties?.forecastItems[0].waveDirection).toBe(275.7);
  expect(responseObj.features.find((f) => f.id == '60.08,21.11')?.properties?.forecastItems[0].waveHeight).toBe(0.3);

  expect(responseObj.features.find((f) => f.id == '59.994667,23.995667')?.properties?.forecastItems[0].waveDirection).toBe(247.4);
  expect(responseObj.features.find((f) => f.id == '59.994667,23.995667')?.properties?.forecastItems[0].waveHeight).toBe(0.8);
  expect(responseObj.features.find((f) => f.id == '59.994667,23.995667')?.properties?.name.fi).toBe('Jakob Ramsjö säähavaintoasema');

  expect(responseObj).toMatchSnapshot();
});

it('should return same cache headers for various features of non buoy/mareograph/observation', async () => {
  const featureCacheHeaders = getFeatureCacheControlHeaders('circle')?.['Cache-Control'];

  const vtsResponse = await handler(mockFeaturesALBEvent('vtsline'));
  assert(vtsResponse.body);
  expect(vtsResponse?.multiValueHeaders?.['Cache-Control']).toStrictEqual(featureCacheHeaders);

  const areaResponse = await handler(mockFeaturesALBEvent('area', '1,2'));
  assert(areaResponse.body);
  expect(areaResponse?.multiValueHeaders?.['Cache-Control']).toStrictEqual(featureCacheHeaders);

  const linesResponse = await handler(mockFeaturesALBEvent('line', '1,2'));
  assert(linesResponse.body);
  expect(linesResponse?.multiValueHeaders?.['Cache-Control']).toStrictEqual(featureCacheHeaders);

  const observationFeatureHeaders = getFeatureCacheControlHeaders('observation')?.['Cache-Control'];
  expect(featureCacheHeaders).not.toEqual(observationFeatureHeaders);
});
