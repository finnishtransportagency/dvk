import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { handler } from '../lib/lambda/graphql/query/fairwayCardFairways-handler';
import { mockContext, mockQueryFairwayCardArgsFairwayCardEvent } from './mocks';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { sdkStreamMixin } from '@smithy/util-stream';
import { createReadStream } from 'fs';
import { pilotPlaceMap } from '../lib/lambda/db/modelMapper';
import { StreamingBlobPayloadOutputTypes } from '@smithy/types';

const ddbMock = mockClient(DynamoDBDocumentClient);
const s3Mock = mockClient(S3Client);

jest.mock('../lib/lambda/environment', () => ({
  getEnvironment: () => 'mock',
  isPermanentEnvironment: () => false,
}));

const fairways = [
  {
    nimiFI: 'Lieteniemi - Lietesalmi venereitti',
    nimiSV: null,
    vaylalajiKoodi: 2,
    vaylaLajiFI: 'Sisävesiväylä',
    vaylaLajiSV: 'Insjöfarled',
    valaistusKoodi: 2,
    valaistusFI: 'Valaisematon',
    valaistusSV: 'Samma på svenska',
    omistaja: 'Väylävirasto',
    merialueFI: 'Kymijoen vesistö',
    merialueSV: 'Kymmene älv vattendrag',
    alunSeloste: 'Kivikarin I-puolelta Lieteniemen kärjen P-puolelta.',
    paatepisteenSeloste: 'Lietesalmen KA-puolella Virmasvedellä.',
    jnro: 10,
    normaaliKaantosade: null,
    minimiKaantosade: null,
    normaaliLeveys: null,
    minimiLeveys: null,
    varavesi: null,
    lisatieto: null,
    mareografi: null,
    luokitus: [
      {
        luokitusTyyppi: 'Väyläluokitus',
        vaylaluokkaKoodi: 6,
        vaylaluokkaFI: 'VL6: Venereitti',
        vaylaluokkaSV: 'Båtrutt',
      },
      {
        luokitusTyyppi: 'Tekninen luokitus',
        vaylaluokkaKoodi: 6,
        vaylaluokkaFI: 'T6',
        vaylaluokkaSV: null,
      },
      {
        luokitusTyyppi: 'Väylänhoitoluokitus',
        vaylaluokkaKoodi: 3,
        vaylaluokkaFI: 'C',
        vaylaluokkaSE: null,
      },
    ],
    mitoitusalus: null,
  },
];
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
        jnro: 10,
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

const circles = [
  {
    kaantoympyraID: 5,
    halkaisija: 450,
    haraussyvyys: 13.2,
    vertaustaso: 'MW2022',
    lisatieto: null,
    vayla: [
      { jnro: 10, nimiFI: 'Inkoon väylä', nimiSV: 'Ingå farled', luokitus: 1 },
      { jnro: 4360, nimiFI: 'Jakob Ramsjö-Porkkala', nimiSV: 'Jakob Ramsjö-Porkkala', luokitus: 3 },
    ],
    geometria: {
      type: 'Polygon',
      coordinates: [
        [
          [23.9781945015, 60.0055424527],
          [23.9781791232, 60.005718463],
          [23.978133169, 60.0058931283],
          [23.9780569884, 60.0060651192],
          [23.9779511614, 60.0062331268],
          [23.9778164933, 60.0063958724],
          [23.977654009, 60.0065521174],
          [23.9774649451, 60.0067006727],
          [23.9772507405, 60.0068404077],
          [23.9770130255, 60.006970259],
          [23.9767536092, 60.0070892382],
          [23.9764744659, 60.00719644],
          [23.9761777201, 60.0072910484],
          [23.9758656301, 60.0073723433],
          [23.9755405712, 60.0074397062],
          [23.9752050173, 60.0074926243],
          [23.9748615221, 60.0075306949],
          [23.9745126998, 60.0075536282],
          [23.9741612052, 60.0075612497],
          [23.9738097134, 60.0075535014],
          [23.9734608994, 60.0075304423],
          [23.973117418, 60.0074922479],
          [23.9727818831, 60.0074392088],
          [23.9724568485, 60.0073717287],
          [23.9721447879, 60.0072903212],
          [23.9718480762, 60.0071956058],
          [23.9715689716, 60.0070883034],
          [23.9713095982, 60.0069692305],
          [23.97107193, 60.0068392936],
          [23.9708577759, 60.0066994813],
          [23.9706687656, 60.0065508578],
          [23.9705063376, 60.0063945542],
          [23.9703717282, 60.0062317601],
          [23.9702659618, 60.0060637144],
          [23.9701898433, 60.005891696],
          [23.970143952, 60.0057170142],
          [23.9701286372, 60.0055409982],
          [23.9701440155, 60.0053649879],
          [23.9701899697, 60.0051903226],
          [23.9702661503, 60.0050183317],
          [23.9703719773, 60.0048503241],
          [23.9705066454, 60.0046875786],
          [23.9706691297, 60.0045313335],
          [23.9708581936, 60.0043827782],
          [23.9710723982, 60.0042430432],
          [23.9713101132, 60.0041131919],
          [23.9715695295, 60.0039942127],
          [23.9718486728, 60.0038870109],
          [23.9721454186, 60.0037924025],
          [23.9724575086, 60.0037111076],
          [23.9727825675, 60.0036437447],
          [23.9731181215, 60.0035908266],
          [23.9734616167, 60.003552756],
          [23.9738104389, 60.0035298227],
          [23.9741619335, 60.0035222012],
          [23.9745134253, 60.0035299495],
          [23.9748622393, 60.0035530086],
          [23.9752057208, 60.003591203],
          [23.9755412556, 60.0036442421],
          [23.9758662902, 60.0037117222],
          [23.9761783508, 60.0037931298],
          [23.9764750625, 60.0038878451],
          [23.9767541671, 60.0039951476],
          [23.9770135405, 60.0041142204],
          [23.9772512087, 60.0042441574],
          [23.9774653628, 60.0043839696],
          [23.9776543731, 60.0045325931],
          [23.9778168011, 60.0046888967],
          [23.9779514105, 60.0048516908],
          [23.9780571769, 60.0050197365],
          [23.9781332954, 60.0051917549],
          [23.9781791867, 60.0053664368],
          [23.9781945015, 60.0055424527],
        ],
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
        jnro: 10,
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

const boardLines = [
  {
    taululinjaId: 2917,
    suunta: 43.3,
    etuTLId: 11421,
    keskiTLId: null,
    takaTLId: 11682,
    vayla: [{ jnro: 10, nimiFI: 'Etelä-Suomen talviväylä, Porkkala-Helsinki', nimiSV: 'Södra Finlands vinterfarled, Porkkala-Helsinki' }],
    geometria: {
      type: 'LineString',
      coordinates: [
        [24.7538942256, 60.0940758347],
        [24.7396585347, 60.0865357684],
        [24.6720255689, 60.0506451596],
      ],
    },
  },
];

const restrictionAreas = [
  {
    id: 154814,
    rajoitustyyppi: null,
    rajoitustyypit: [
      {
        koodi: '01',
        rajoitustyyppi: 'Nopeusrajoitus',
      },
    ],
    suuruus: 17,
    esittaja: 'Merenkulkulaitos',
    diaariNumero: '367/614/2007',
    vahvistusPaivamaara: '2008-12-01',
    muutosPaivamaara: null,
    alkuPaivamaara: '2009-01-01',
    loppuPaivamaara: null,
    paatosTila: null,
    tietolahde: null,
    sijainti: 'Vuosaaren väylällä, Krokholmshället - Vuosaaren satama sekä satama-alue.',
    kunta: 'Helsinki',
    poikkeus:
      'Rajoitus ei koske virka-, sairaankuljetus- ja pelastustoimen suorittamiseksi tai muusta vastaavasta syystä välttämätöntä vesikulkuneuvolla liikkumista eikä puolustusvoimien toimintaa.',
    vayla: [
      {
        jnro: 10,
        nimiFI: 'Vuosaaren väylä',
        nimiSV: null,
      },
    ],
    geometria: {
      type: 'Polygon',
      coordinates: [
        [
          [25.2132576757, 60.2060039303],
          [25.2179721679, 60.2022738974],
          [25.2209329635, 60.198328623],
          [25.2195254418, 60.1922976458],
          [25.2188200687, 60.1901032927],
          [25.222442519, 60.1899958035],
          [25.2230924326, 60.1919949507],
          [25.2249204182, 60.1969721382],
          [25.2266563935, 60.2014733847],
          [25.2162821556, 60.206674288],
          [25.2141650525, 60.2079515081],
          [25.2105012541, 60.211192521],
          [25.2086270747, 60.2148557424],
          [25.2059541946, 60.2200786305],
          [25.1984041026, 60.2213831984],
          [25.1982769283, 60.2212367311],
          [25.1973308093, 60.2206857574],
          [25.1973506971, 60.2205710222],
          [25.1973443434, 60.2205669953],
          [25.1973446766, 60.2205637608],
          [25.1974018327, 60.2205388745],
          [25.19733819, 60.220500644],
          [25.1974028114, 60.2204731591],
          [25.1970451885, 60.2202650285],
          [25.2002229594, 60.2189133554],
          [25.1999863007, 60.2187756352],
          [25.1968113952, 60.2201285964],
          [25.1964519696, 60.2199198073],
          [25.1963870645, 60.21994742],
          [25.1963242506, 60.2199110756],
          [25.1963191392, 60.2199114269],
          [25.1962631012, 60.2199348036],
          [25.1962500936, 60.2199318689],
          [25.1960189444, 60.2199224174],
          [25.1958537741, 60.2198266114],
          [25.1950767865, 60.2195010463],
          [25.20087191, 60.2160980117],
          [25.201276531, 60.2162682753],
          [25.2013309823, 60.2162442016],
          [25.2019607568, 60.2158739078],
          [25.2019991105, 60.2158433102],
          [25.2016020388, 60.2156757004],
          [25.2016009772, 60.2156693637],
          [25.2034477127, 60.2145835581],
          [25.2037079673, 60.214435099],
          [25.2039376354, 60.214296306],
          [25.2039659452, 60.2142728185],
          [25.2037041734, 60.2141626298],
          [25.2036623045, 60.2141803967],
          [25.2013196754, 60.2155570133],
          [25.2001378803, 60.2150568178],
          [25.2014234943, 60.2143012632],
          [25.2014268293, 60.2143026782],
          [25.2024411187, 60.2137071489],
          [25.2024991754, 60.213658007],
          [25.2023545387, 60.2135964922],
          [25.2022678755, 60.2136339187],
          [25.1999708552, 60.2149874331],
          [25.1999690515, 60.2149874404],
          [25.1987967029, 60.2144933504],
          [25.2006074887, 60.2134301075],
          [25.200635607, 60.2134072597],
          [25.200635789, 60.2134068092],
          [25.2006000787, 60.2133857865],
          [25.1980248517, 60.2123006533],
          [25.1979774869, 60.2122869342],
          [25.1979758699, 60.2122871104],
          [25.1979357862, 60.2123038899],
          [25.1892443466, 60.217408716],
          [25.1877139084, 60.2167635868],
          [25.1906328445, 60.2150485936],
          [25.1903558087, 60.2149317925],
          [25.1874399333, 60.2166462226],
          [25.1859084114, 60.216000571],
          [25.1941976595, 60.2111330664],
          [25.1946010837, 60.2113038274],
          [25.194604337, 60.2113040046],
          [25.194656248, 60.2112801091],
          [25.1950524902, 60.2110474116],
          [25.1921578693, 60.2098271301],
          [25.1925139539, 60.2096166135],
          [25.192508605, 60.2096143546],
          [25.1924494922, 60.2095893662],
          [25.1924796616, 60.2095717797],
          [25.1924787775, 60.2095702796],
          [25.1922471803, 60.2094728491],
          [25.1923866124, 60.209390953],
          [25.1929196049, 60.2087652074],
          [25.1929813916, 60.2087699749],
          [25.1930198223, 60.2086465909],
          [25.1947363913, 60.2087303442],
          [25.1955735897, 60.2089699222],
          [25.1963256936, 60.2090279259],
          [25.1981951578, 60.2088139115],
          [25.2026365399, 60.2088886214],
          [25.2076087344, 60.208972086],
          [25.2093606885, 60.2080516021],
          [25.2108277235, 60.2072807868],
          [25.2132576757, 60.2060039303],
        ],
      ],
    },
  },
];

const prohibitionAreas = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [118615.13697811, 6667254.34387074],
            [118607.57144377, 6667077.39860421],
            [119056.32001752, 6667065.07649735],
            [119430.96165268, 6666980.25399899],
            [119458.54593377, 6667158.83712926],
            [119424.31313345, 6667152.82494862],
            [119018.31102416, 6667208.05956297],
            [118632.18081231, 6667247.56113973],
            [118615.13697811, 6667254.34387074],
          ],
        ],
      },
      properties: {
        ALUENRO: 24,
        RAJOITE_TYYPPI: 'kohtaamiskieltoalue, ohittamiskieltoalue',
        VTS_ALUE: 'Archipelago VTS',
        LISATIETO: 'Lisätieto',
        LISATIETO_SV: 'Lisätieto sv',
        JNRO: 10,
        VAYLA_NIMI: 'Lieteniemi - Lietesalmi venereitti',
      },
    },
  ],
};

jest.mock('../lib/lambda/api/axios', () => ({
  fetchVATUByApi: (api: string) => {
    if (api === 'navigointilinjat') {
      return lines;
    } else if (api === 'vaylat') {
      return fairways;
    } else if (api === 'vaylaalueet') {
      return areas;
    } else if (api === 'kaantoympyrat') {
      return circles;
    } else if (api === 'taululinjat') {
      return boardLines;
    } else if (api === 'rajoitusalueet') {
      return restrictionAreas;
    }
    return [];
  },
  fetchTraficomApi: () => prohibitionAreas,
}));

beforeEach(() => {
  jest.resetAllMocks();
  ddbMock.reset();
  s3Mock.reset();
  pilotPlaceMap.clear();
});

it('should get fairway card fairways from cache', async () => {
  const stream = sdkStreamMixin(createReadStream('./test/data/fairways.json')) as StreamingBlobPayloadOutputTypes;
  const expires = new Date();
  expires.setTime(expires.getTime() + 1 * 60 * 60 * 1000);
  s3Mock.on(GetObjectCommand).resolves({ Body: stream, ExpiresString: expires.toString() });
  const response = await handler(mockQueryFairwayCardArgsFairwayCardEvent, mockContext, () => {});
  expect(response).toMatchSnapshot();
});

it('should get fairway card fairways from api when cache expired', async () => {
  const stream = sdkStreamMixin(createReadStream('./test/data/fairways.json')) as StreamingBlobPayloadOutputTypes;
  const expires = new Date();
  expires.setTime(expires.getTime() - 1 * 60 * 60 * 1000);
  s3Mock.on(GetObjectCommand).resolves({ Body: stream, ExpiresString: expires.toString() });
  const response = await handler(mockQueryFairwayCardArgsFairwayCardEvent, mockContext, () => {});
  expect(response).toMatchSnapshot();
});
