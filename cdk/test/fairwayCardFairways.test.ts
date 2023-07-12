import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { handler } from '../lib/lambda/graphql/query/fairwayCardFairways-handler';
import { mockContext, mockQueryFairwayCardArgsFairwayCardEvent } from './mocks';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { createReadStream } from 'fs';
import { pilotPlaceMap } from '../lib/lambda/db/modelMapper';

const ddbMock = mockClient(DynamoDBDocumentClient);
const s3Mock = mockClient(S3Client);

jest.mock('../lib/lambda/environment', () => ({
  getFeatureCacheDurationHours: () => 2,
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

jest.mock('../lib/lambda/api/axios', () => ({
  fetchVATUByApi: (api: string) => {
    if (api === 'navigointilinjat') {
      return lines;
    } else if (api === 'vaylat') {
      return fairways;
    }
    return [];
  },
}));

beforeEach(() => {
  jest.resetAllMocks();
  ddbMock.reset();
  s3Mock.reset();
  pilotPlaceMap.clear();
});

it('should get fairway card fairways from cache', async () => {
  const stream = createReadStream('./test/data/fairways.json');
  const expires = new Date();
  expires.setTime(expires.getTime() + 1 * 60 * 60 * 1000);
  s3Mock.on(GetObjectCommand).resolves({ Body: stream, Expires: expires });
  const response = await handler(mockQueryFairwayCardArgsFairwayCardEvent, mockContext, () => {});
  expect(response).toMatchSnapshot();
});

it('should get fairway card fairways from api when cache expired', async () => {
  const stream = createReadStream('./test/data/fairways.json');
  const expires = new Date();
  expires.setTime(expires.getTime() - 1 * 60 * 60 * 1000);
  s3Mock.on(GetObjectCommand).resolves({ Body: stream, Expires: expires });
  const response = await handler(mockQueryFairwayCardArgsFairwayCardEvent, mockContext, () => {});
  expect(response).toMatchSnapshot();
});
