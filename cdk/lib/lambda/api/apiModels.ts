import { Geometry } from 'geojson';
import { GeometryPoint, Text } from '../../../graphql/generated';
import { FairwayCardIdName } from '../db/fairwayCardDBModel';

export type VaylaGeojsonFeature = { type?: string; geometry: Geometry };

/* VATU */
type MitoitusAlusAPIModel = {
  alustyyppiKoodi: string;
  alustyyppi: string;
  pituus: number;
  leveys: number;
  syvays: number;
  koko?: number;
  runkoTaytelaisyysKerroin?: number;
};

type LuokitusAPIModel = {
  luokitusTyyppi: string;
  vaylaluokkaKoodi: string;
  vaylaluokkaFI?: string;
  vaylaluokkaSV?: string;
};

export type VaylaAPIModel = {
  jnro: number;
  nimiFI: string;
  nimiSV?: string;
  vaylalajiKoodi?: string;
  vaylaLajiFI?: string;
  vaylaLajiSV?: string;
  valaistusKoodi?: string;
  valaistusFI?: string;
  valaistusSV?: string;
  omistaja?: string;
  merialueFI?: string;
  merialueSV?: string;
  alunSeloste?: string;
  paatepisteenSeloste?: string;
  normaaliKaantosade?: number;
  minimiKaantosade?: number;
  normaaliLeveys?: number;
  minimiLeveys?: number;
  varavesi?: string;
  lisatieto?: string;
  mareografi?: string;
  mitoitusalus?: MitoitusAlusAPIModel[];
  luokitus?: LuokitusAPIModel[];
};

export type VaylaFeature = { properties: VaylaAPIModel };
export type VaylaFeatureCollection = { type?: string; features: VaylaFeature[] };

type AlueVaylaAPIModel = {
  jnro: number;
  status: number;
  linjaus: number;
  mitoitusNopeus?: number;
  mitoitusNopeus2?: number;
  vaylaalueenJarjestysNro?: number;
  nimiFI?: string;
  nimiSV?: string;
};

type AlueProperties = {
  id: number;
  nimi?: string;
  mitoitusSyvays?: number;
  harausSyvyys?: number;
  vertaustaso?: string;
  n2000MitoitusSyvays?: number;
  n2000HarausSyvyys?: number;
  n2000Vertaustaso?: string;
  suunta?: number;
  diaariNumero?: string;
  vahvistusPaivamaara?: string;
  omistaja?: string;
  lisatieto?: string;
  vayla?: AlueVaylaAPIModel[];
  tyyppiKoodi?: number;
  tyyppi?: string;
  merkintalajiKoodi?: number;
  merkintalaji?: string;
  liikennointiStatusKoodi?: number;
  liikennointiStatus?: string;
  liikennointiTyyppiKoodi?: number;
  liikenteenTyyppi?: string;
  liikennointiSuuntaKoodi?: number;
  liikennointiSuunta?: string;
};

export type AlueFeature = {
  properties: AlueProperties;
} & VaylaGeojsonFeature;

export type AlueFeatureCollection = {
  type?: string;
  features: AlueFeature[];
};

type NavigointiLinjaVaylaAPIModel = {
  jnro: number;
  status?: number;
  linjaus?: number;
  nimiFI?: string;
  nimiSV?: string;
};

type NavigointiLinjaProperties = {
  id: number;
  mitoitusSyvays?: number;
  harausSyvyys?: number;
  vertaustaso?: string;
  n2000MitoitusSyvays?: number;
  n2000HarausSyvyys?: number;
  n2000Vertaustaso?: string;
  tosisuunta?: number;
  pituus?: number;
  diaariNumero?: string;
  vahvistusPaivamaara?: string;
  omistaja?: string;
  lisatieto?: string;
  tyyppiKoodi?: string;
  tyyppi?: string;
  vayla: NavigointiLinjaVaylaAPIModel[];
};

export type NavigointiLinjaFeature = {
  properties: NavigointiLinjaProperties;
} & VaylaGeojsonFeature;

export type NavigointiLinjaFeatureCollection = {
  type?: string;
  features: NavigointiLinjaFeature[];
};

type RajoitustyyppiAPIModel = {
  koodi?: string;
  rajoitustyyppi?: string;
};

type RajoitusVaylaAPIModel = {
  jnro: number;
  nimiFI?: string;
  nimiSV?: string;
};

type RajoitusAlueProperties = {
  id: number;
  rajoitustyyppi?: string;
  rajoitustyypit?: RajoitustyyppiAPIModel[];
  suuruus?: number;
  esittaja?: string;
  diaariNumero?: string;
  vahvistusPaivamaara?: string;
  muutosPaivamaara?: string;
  alkuPaivamaara?: string;
  loppuPaivamaara?: string;
  paatosTila?: string;
  tietolahde?: string;
  sijainti?: string;
  kunta?: string;
  poikkeus?: string;
  vayla?: RajoitusVaylaAPIModel[];
};

export type RajoitusAlueFeature = { properties: RajoitusAlueProperties } & VaylaGeojsonFeature;

export type RajoitusAlueFeatureCollection = {
  type?: string;
  features: RajoitusAlueFeature[];
};

export type TurvalaiteVaylaAPIModel = {
  jnro: number;
  paavayla?: string;
};

export type TurvalaiteVikatiedotProperties = {
  vikaId: number;
  turvalaiteNumero: number;
  turvalaiteNimiFI: string;
  turvalaiteNimiSV?: string;
  vikatyyppiKoodi: number;
  vikatyyppiFI: string;
  vikatyyppiSV?: string;
  vikatyyppiEN?: string;
  kirjausAika: string;
};
export type TurvalaiteVikatiedotFeature = { properties: TurvalaiteVikatiedotProperties } & VaylaGeojsonFeature;
export type TurvalaiteVikatiedotFeatureCollection = {
  type?: string;
  features: TurvalaiteVikatiedotFeature[];
};

type TurvalaiteReunaetaisyysAPIModel = {
  vaylaalueID: number;
  etaisyys: number;
};

type TurvalaiteProperties = {
  turvalaitenumero: number;
  nimiFI?: string;
  nimiSV?: string;
  alityyppi?: string;
  turvalaitetyyppiKoodi?: number;
  turvalaitetyyppiFI?: string;
  turvalaitetyyppiSV?: string;
  navigointilajiKoodi?: number;
  navigointilajiFI?: string;
  navigointilajiSV?: string;
  valaistu?: string;
  omistajaFI?: string;
  omistajaSV?: string;
  symboli?: string;
  kaukohallinta?: number;
  AISTyyppi?: number;
  AISTyyppiSeliteFI?: string;
  AISTyyppiSeliteSV?: string;
  vayla?: TurvalaiteVaylaAPIModel[];
  reunaetaisyys?: TurvalaiteReunaetaisyysAPIModel[];
};

export type TurvalaiteFeature = { properties: TurvalaiteProperties } & VaylaGeojsonFeature;

export type TurvalaiteFeatureCollection = {
  type?: string;
  features: TurvalaiteFeature[];
};

export type TaululinjaVaylaAPIModel = {
  jnro: number;
  nimiFI?: string;
  nimiSV?: string;
};

export type TaululinjaProperties = {
  taululinjaId: number;
  suunta: number;
  etuTLId?: number;
  keskiTLId?: number;
  takaTLId?: number;
  vayla: TaululinjaVaylaAPIModel[];
};

export type TaululinjaFeature = { properties: TaululinjaProperties } & VaylaGeojsonFeature;
export type TaululinjaFeatureCollection = {
  type?: string;
  features: TaululinjaFeature[];
};

type KaantoympyraVaylaAPIModel = {
  jnro: number;
  nimiFI: string;
  nimiSV?: string;
  luokitus: number;
};

export type KaantoympyraProperties = {
  kaantoympyraID: number;
  halkaisija: number;
  haraussyvyys?: number;
  vertaustaso?: string;
  lisatieto?: string;
  vayla?: KaantoympyraVaylaAPIModel[];
};

export type KaantoympyraFeature = { properties: KaantoympyraProperties } & VaylaGeojsonFeature;

export type KaantoympyraFeatureCollection = { type?: string; features: KaantoympyraFeature[] };

/* Traficom */
export type PilotPlace = {
  id: number;
  name: Text;
  geometry: GeometryPoint;
  fairwayCards: FairwayCardIdName[];
};

/* Pooki */
export type MarineWarningDates = {
  startDateTime?: number;
  endDateTime?: number;
  dateTime?: number;
};

/* Weather */
export type WeatherMareograph = {
  fmisid: number;
  geoid: number;
  latlon: string;
  station_name: string;
  localtime: string;
  WLEV_PT1S_INSTANT: number;
  WLEVN2K_PT1S_INSTANT: number;
};

export type Mareograph = {
  id: number;
  geometry: Geometry;
  name: string;
  dateTime: number;
  waterLevel: number;
  n2000WaterLevel: number;
  calculated: boolean;
};

export type WeatherObservation = {
  fmisid: number;
  geoid: number;
  latlon: string;
  stationname: string;
  localtime: string;
  WG_PT10M_MAX: number;
  WD_PT10M_AVG: number;
  WS_PT10M_AVG: number;
  TA_PT1M_AVG: number;
  VIS_PT1M_AVG: number | null;
};

export type Observation = {
  id: number;
  name: string;
  windSpeedAvg: number;
  windSpeedMax: number;
  windDirection: number;
  visibility: number | null;
  temperature: number;
  dateTime: number;
  geometry: Geometry;
};

export type WeatherBuoy = {
  fmisid: number;
  geoid: number;
  latlon: string;
  station_name: string;
  localtime: string;
  WH_PT1M_ACC: number | null;
  WHD_PT1M_ACC: number | null;
  TW_PT1M_AVG: number | null;
};

export type Buoy = {
  id: number;
  name: string;
  dateTime: number;
  geometry: Geometry;
  temperature: number | null;
  waveDirection: number | null;
  waveHeight: number | null;
};

/* AIS */
export type VesselAPIModel = {
  name: string;
  timestamp: number;
  mmsi: number;
  callSign: string;
  imo: number;
  shipType: number;
  draught: number;
  eta: number;
  posType: number;
  referencePointA: number;
  referencePointB: number;
  referencePointC: number;
  referencePointD: number;
  destination: string;
};

type VesselLocationProperties = {
  mmsi: number;
  sog: number;
  cog: number;
  navStat: number;
  rot: number;
  posAcc: boolean;
  raim: boolean;
  heading?: number;
  timestamp: number;
  timestampExternal: number;
};

type VesselLocationFeature = {
  mmsi: number;
  type?: string;
  geometry: Geometry;
  properties: VesselLocationProperties;
};

export type VesselLocationFeatureCollection = {
  type?: string;
  dataUpdatedTime?: string;
  features: VesselLocationFeature[];
};

export type Vessel = {
  name: string;
  timestamp: Date;
  mmsi: number;
  callSign: string;
  imo: number;
  shipType: number;
  draught: number; // meters
  eta: string; // MM-DD HH:mm
  posType: number;
  referencePointA: number;
  referencePointB: number;
  referencePointC: number;
  referencePointD: number;
  destination: string;
};

/* RTZ */
export type Coordinate = [number, number];

export type RtzWaypoint = {
  coordinate: Coordinate;
  turnRadius: number;
};

type RtzGeometria = {
  type: string;
  coordinates: Coordinate;
};

export type RtzReittipiste = {
  tunnus: number;
  nimi: string;
  rtzTunniste: number;
  reittitunnus: number;
  kaarresade: number;
  geometria: RtzGeometria;
  leveysVasen: number;
  leveysOikea: number;
  geometriaTyyppi: string;
  muutosaikaleima: string;
  jarjestys: number;
};

export type RtzData = {
  tunnus: number;
  tila: number;
  nimi: string;
  tunniste: string;
  rtz: string;
  reittipisteet: Array<RtzReittipiste>;
};

/* IBNet */
export type IBNetApiResponse = {
  rvEndpoints: string[];
  toRv: string;
};

export type Dirway = {
  id: string;
  name: string;
  description: string;
  rv: number | null;
  change_time: string;
  deleted?: boolean | null;
};

export type DirwayPoint = {
  id: string;
  dirway_id: string;
  order_num: number;
  name: string;
  latitude: number;
  longitude: number;
  rv: number | null;
  change_time: string;
  deleted?: boolean | null;
};

export type LocationApiModel = {
  id: string;
  name: string;
  type: 'PORT' | 'FAIRWAY';
  locode_list: string;
  nationality: string;
  latitude: number;
  longitude: number;
  winterport: boolean;
  rv: number | null;
  change_time: string;
  deleted?: boolean | null;
};

export type RestrictionApiModel = {
  id: string;
  location_id: string;
  start_time: string;
  end_time?: string | null;
  text_compilation: string;
  rv: number | null;
  change_time: string;
  deleted?: boolean | null;
};
