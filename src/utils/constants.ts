const featureLoaderUrl = import.meta.env.VITE_APP_REST_API_URL
  ? import.meta.env.VITE_APP_REST_API_URL + '/featureloader'
  : globalThis.location.origin + '/api/featureloader';

const aisVesselsUrl = import.meta.env.VITE_APP_REST_API_URL
  ? import.meta.env.VITE_APP_REST_API_URL + '/aisvessels'
  : globalThis.location.origin + '/api/aisvessels';

const aisLocationsUrl = import.meta.env.VITE_APP_REST_API_URL
  ? import.meta.env.VITE_APP_REST_API_URL + '/aislocations'
  : globalThis.location.origin + '/api/aislocations';

const staticUrl = import.meta.env.VITE_APP_STATIC_URL
  ? `https://${import.meta.env.VITE_APP_STATIC_URL}/s3static`
  : globalThis.location.origin + '/s3static';

export const imageUrl = import.meta.env.VITE_APP_IMAGE_URL ? import.meta.env.VITE_APP_IMAGE_URL : globalThis.location.origin + '/s3static/';

export type BackgroundLayerId = 'finland' | 'mml_meri' | 'mml_jarvi' | 'mml_satamat' | 'mml_laiturit' | 'balticsea';

export type StaticFeatureDataId = 'balticsea' | 'finland' | 'mml_meri' | 'mml_jarvi' | 'mml_satamat' | 'mml_laiturit' | 'name';

export type FeatureDataId =
  | 'area12'
  | 'area3456'
  | 'line12'
  | 'line3456'
  | 'restrictionarea'
  | 'pilot'
  | 'harbor'
  | 'safetyequipment'
  | 'depth12'
  | 'safetyequipmentfault'
  | 'marinewarning'
  | 'boardline12'
  | 'mareograph'
  | 'observation'
  | 'buoy'
  | 'vtsline'
  | 'vtspoint'
  | 'circle'
  | 'soundingpoint'
  | 'specialarea2'
  | 'specialarea15'
  | 'aislocation'
  | 'aisvessel';

export type StaticFeatureDataSource = { id: StaticFeatureDataId; url: URL };

export const StaticFeatureDataSources: Array<StaticFeatureDataSource> = [
  { id: 'name', url: new URL(staticUrl + '/names.json.gz') },
  { id: 'balticsea', url: new URL(staticUrl + '/balticsea.json.gz') },
  { id: 'finland', url: new URL(staticUrl + '/finland.json.gz') },
  { id: 'mml_meri', url: new URL(staticUrl + '/mml-meri.json.gz') },
  { id: 'mml_jarvi', url: new URL(staticUrl + '/mml-jarvi-20230505.json.gz') },
  { id: 'mml_satamat', url: new URL(staticUrl + '/mml-satamat-20230712.json.gz') },
  { id: 'mml_laiturit', url: new URL(staticUrl + '/mml-laiturit.json.gz') },
];

export type FeatureDataSource = { id: FeatureDataId; url: URL; staticUrl: URL; persist: boolean };

export const FeatureDataSources: Array<FeatureDataSource> = [
  {
    id: 'area12',
    url: new URL(featureLoaderUrl + '?type=area&vaylaluokka=1,2'),
    staticUrl: new URL(staticUrl + '/area12.json.gz'),
    persist: true,
  },
  {
    id: 'area3456',
    url: new URL(featureLoaderUrl + '?type=area&vaylaluokka=3,4,5,6'),
    staticUrl: new URL(staticUrl + '/area3456.json.gz'),
    persist: true,
  },
  {
    id: 'line12',
    url: new URL(featureLoaderUrl + '?type=line&vaylaluokka=1,2'),
    staticUrl: new URL(staticUrl + '/line12.json.gz'),
    persist: true,
  },
  {
    id: 'line3456',
    url: new URL(featureLoaderUrl + '?type=line&vaylaluokka=3,4,5,6'),
    staticUrl: new URL(staticUrl + '/line3456.json.gz'),
    persist: true,
  },
  {
    id: 'restrictionarea',
    url: new URL(featureLoaderUrl + '?type=restrictionarea&vaylaluokka=1,2'),
    staticUrl: new URL(staticUrl + '/restrictionarea.json.gz'),
    persist: true,
  },
  {
    id: 'specialarea2',
    url: new URL(featureLoaderUrl + '?type=specialarea2&vaylaluokka=1,2,3,4,5,6'),
    staticUrl: new URL(staticUrl + '/specialarea2.json.gz'),
    persist: true,
  },
  {
    id: 'specialarea15',
    url: new URL(featureLoaderUrl + '?type=specialarea15&vaylaluokka=1,2,3,4,5,6'),
    staticUrl: new URL(staticUrl + '/specialarea15.json.gz'),
    persist: true,
  },
  {
    id: 'pilot',
    url: new URL(featureLoaderUrl + '?type=pilot'),
    staticUrl: new URL(staticUrl + '/pilot.json.gz'),
    persist: true,
  },
  {
    id: 'harbor',
    url: new URL(featureLoaderUrl + '?type=harbor'),
    staticUrl: new URL(staticUrl + '/harbor.json.gz'),
    persist: true,
  },
  {
    id: 'safetyequipment',
    url: new URL(featureLoaderUrl + '?type=safetyequipment&vaylaluokka=1,2,99'),
    staticUrl: new URL(staticUrl + '/safetyequipment.json.gz'),
    persist: true,
  },
  {
    id: 'depth12',
    url: new URL(featureLoaderUrl + '?type=depth&vaylaluokka=1,2'),
    staticUrl: new URL(staticUrl + '/depth12.json.gz'),
    persist: true,
  },
  {
    id: 'safetyequipmentfault',
    url: new URL(featureLoaderUrl + '?type=safetyequipmentfault'),
    staticUrl: new URL(staticUrl + '/safetyequipmentfault.json.gz'),
    persist: true,
  },
  {
    id: 'marinewarning',
    url: new URL(featureLoaderUrl + '?type=marinewarning'),
    staticUrl: new URL(staticUrl + '/marinewarning.json.gz'),
    persist: true,
  },
  {
    id: 'boardline12',
    url: new URL(featureLoaderUrl + '?type=boardline&vaylaluokka=1,2'),
    staticUrl: new URL(staticUrl + '/boardline12.json.gz'),
    persist: true,
  },
  {
    id: 'mareograph',
    url: new URL(featureLoaderUrl + '?type=mareograph'),
    staticUrl: new URL(staticUrl + '/mareograph.json.gz'),
    persist: false,
  },
  {
    id: 'observation',
    url: new URL(featureLoaderUrl + '?type=observation'),
    staticUrl: new URL(staticUrl + '/observation.json.gz'),
    persist: false,
  },
  {
    id: 'buoy',
    url: new URL(featureLoaderUrl + '?type=buoy'),
    staticUrl: new URL(staticUrl + '/buoy.json.gz'),
    persist: false,
  },
  {
    id: 'vtsline',
    url: new URL(featureLoaderUrl + '?type=vtsline'),
    staticUrl: new URL(staticUrl + '/vtsline.json.gz'),
    persist: true,
  },
  {
    id: 'vtspoint',
    url: new URL(featureLoaderUrl + '?type=vtspoint'),
    staticUrl: new URL(staticUrl + '/vtspoint.json.gz'),
    persist: true,
  },
  {
    id: 'circle',
    url: new URL(featureLoaderUrl + '?type=circle'),
    staticUrl: new URL(staticUrl + '/circle.json.gz'),
    persist: true,
  },
  {
    id: 'aislocation',
    url: new URL(aisLocationsUrl),
    staticUrl: new URL(staticUrl + '/aislocations.json.gz'),
    persist: false,
  },
  {
    id: 'aisvessel',
    url: new URL(aisVesselsUrl),
    staticUrl: new URL(staticUrl + '/aisvessels.json.gz'),
    persist: false,
  },
];

export type FeatureDataMainLayerId = 'merchant' | 'othertraffic' | 'conditions' | 'vts' | 'depths' | 'marinewarning' | 'ais';

export type FeatureDataLayerId =
  | 'area12'
  | 'area3456'
  | 'line12'
  | 'line3456'
  | 'speedlimit'
  | 'specialarea'
  | 'pilot'
  | 'harbor'
  | 'quay'
  | 'safetyequipment'
  | 'safetyequipmentfault'
  | 'depth12'
  | 'coastalwarning'
  | 'localwarning'
  | 'boaterwarning'
  | 'name'
  | 'boardline12'
  | 'mareograph'
  | 'ice'
  | 'observation'
  | 'buoy'
  | 'vtsline'
  | 'vtspoint'
  | 'soundingpoint'
  | 'depthcontour'
  | 'deptharea'
  | 'circle'
  | 'specialarea2'
  | 'specialarea15'
  | 'aisvesselcargo'
  | 'aisvesseltanker'
  | 'aisvesselpassenger'
  | 'aisvesselhighspeed'
  | 'aisvesseltugandspecialcraft'
  | 'aisvesselfishing'
  | 'aisvesselpleasurecraft'
  | 'aisnavigationaidequipment'
  | 'aisunspecified';

export type SelectedFairwayCardLayerId = 'selectedfairwaycard';
export type FairwayWidthLayerId = 'fairwaywidth';

export type UserLocationLayerId = 'userlocation';

export type FeatureLayerId = FeatureDataLayerId | SelectedFairwayCardLayerId | FairwayWidthLayerId | UserLocationLayerId;

export type UserLocationPermission = 'on' | 'off' | 'disabled';

export type Lang = 'fi' | 'sv' | 'en';

type DataLayer = { id: FeatureDataLayerId; offlineSupport: boolean; localizedStyle: boolean };

type MapType = {
  EPSG: string;
  EXTENT: number[];
  RESOLUTIONS: number[];
  INIT_CENTER: number[];
  INIT_RESOLUTION: number;
  FEATURE_DATA_LAYERS: Array<DataLayer>;
};

export const MAP: MapType = {
  EPSG: 'EPSG:3067',
  EXTENT: [61000, 6605000, 733000, 7777000],
  RESOLUTIONS: [512, 256, 128, 64, 32, 16, 8, 4, 2, 1, 0.5],
  INIT_CENTER: [384920, 6671856],
  INIT_RESOLUTION: 128,
  FEATURE_DATA_LAYERS: [
    { id: 'area12', offlineSupport: true, localizedStyle: false },
    { id: 'area3456', offlineSupport: true, localizedStyle: false },
    { id: 'line12', offlineSupport: true, localizedStyle: false },
    { id: 'line3456', offlineSupport: true, localizedStyle: false },
    { id: 'speedlimit', offlineSupport: true, localizedStyle: false },
    { id: 'specialarea2', offlineSupport: true, localizedStyle: false },
    { id: 'specialarea15', offlineSupport: true, localizedStyle: false },
    { id: 'pilot', offlineSupport: true, localizedStyle: false },
    { id: 'harbor', offlineSupport: true, localizedStyle: true },
    { id: 'safetyequipment', offlineSupport: true, localizedStyle: false },
    { id: 'depth12', offlineSupport: true, localizedStyle: false },
    { id: 'coastalwarning', offlineSupport: true, localizedStyle: false },
    { id: 'localwarning', offlineSupport: true, localizedStyle: false },
    { id: 'boaterwarning', offlineSupport: true, localizedStyle: false },
    { id: 'boardline12', offlineSupport: true, localizedStyle: false },
    { id: 'mareograph', offlineSupport: false, localizedStyle: false },
    { id: 'ice', offlineSupport: false, localizedStyle: false },
    { id: 'observation', offlineSupport: false, localizedStyle: false },
    { id: 'buoy', offlineSupport: false, localizedStyle: false },
    { id: 'vtsline', offlineSupport: true, localizedStyle: false },
    { id: 'vtspoint', offlineSupport: true, localizedStyle: false },
    { id: 'name', offlineSupport: true, localizedStyle: true },
    { id: 'soundingpoint', offlineSupport: false, localizedStyle: false },
    { id: 'depthcontour', offlineSupport: false, localizedStyle: false },
    { id: 'deptharea', offlineSupport: false, localizedStyle: false },
    { id: 'circle', offlineSupport: true, localizedStyle: false },
    { id: 'aisvesselcargo', offlineSupport: false, localizedStyle: false },
    { id: 'aisvesseltanker', offlineSupport: false, localizedStyle: false },
    { id: 'aisvesselpassenger', offlineSupport: false, localizedStyle: false },
    { id: 'aisvesselhighspeed', offlineSupport: false, localizedStyle: false },
    { id: 'aisvesseltugandspecialcraft', offlineSupport: false, localizedStyle: false },
    { id: 'aisvesselfishing', offlineSupport: false, localizedStyle: false },
    { id: 'aisvesselpleasurecraft', offlineSupport: false, localizedStyle: false },
    { id: 'aisnavigationaidequipment', offlineSupport: false, localizedStyle: false },
    { id: 'aisunspecified', offlineSupport: false, localizedStyle: false },
  ],
};

export const MINIMUM_QUERYLENGTH = 3;
export const MAX_HITS = 20;

export const N2000_URLS = {
  fi: 'www.traficom.fi/fi/liikenne/merenkulku/n2000-vayla-ja-merikarttauudistus',
  sv: 'www.traficom.fi/sv/transport/sjofart/farleds-och-sjokortsreformen-n2000',
  en: 'www.traficom.fi/en/transport/maritime/n2000-fairway-and-nautical-chart-reform-improved',
};

export const MASTERSGUIDE_URLS = {
  fi: 'www.fintraffic.fi/fi/vts/masters-guide',
  sv: 'www.fintraffic.fi/sv/vts/masters-guide',
  en: 'www.fintraffic.fi/en/vts/masters-guide',
};

export const PILOTORDER_URL = 'www.pilotonline.fi';

export const OFFLINE_STORAGE = {
  staleTime: 2 * 60 * 60 * 1000, // 2 hours between server queries
  cacheTime: 24 * 24 * 60 * 60 * 1000, // 24 days between local cache carbage collection
  staleTimeStatic: 50 * 24 * 60 * 60 * 1000, // 50 days for static s3 resources
  cacheTimeStatic: 60 * 24 * 60 * 60 * 1000, // 60 days for static s3 resources
};

export const marineWarningLayers: FeatureDataLayerId[] = ['coastalwarning', 'localwarning', 'boaterwarning'];

export const marineWarningAreas = [
  'gulfOfFinland',
  'northernBalticSea',
  'archipelagoSea',
  'seaOfÅland',
  'bothnianSea',
  'theQuark',
  'bayOfBothnia',
  'saimaa',
  'saimaaCanal',
  'gulfOfBothnia',
];

export const marineWarningTypes = ['coastalWarning', 'localWarning', 'boaterWarning'];
