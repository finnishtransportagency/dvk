const featureLoaderUrl = process.env.REACT_APP_REST_API_URL
  ? process.env.REACT_APP_REST_API_URL + '/featureloader'
  : globalThis.location.origin + '/api/featureloader';

const staticUrl = process.env.REACT_APP_STATIC_URL
  ? `https://${process.env.REACT_APP_STATIC_URL}/s3static`
  : globalThis.location.origin + '/s3static';

export type BackgroundLayerId = 'finland' | 'mml_meri' | 'mml_jarvi' | 'mml_laiturit' | 'balticsea';

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
  | 'name'
  | 'boardline12'
  | 'mareograph'
  | 'observation'
  | 'buoy'
  | 'balticsea'
  | 'finland'
  | 'mml_meri'
  | 'mml_jarvi'
  | 'mml_laiturit'
  | 'vtsline'
  | 'vtspoint'
  | 'circle'
  | 'soundingpoint'
  | 'specialarea2'
  | 'specialarea15';

export type FeatureDataSource = { id: FeatureDataId; url: URL; staticUrl?: URL };

export const FeatureDataSources: Array<FeatureDataSource> = [
  { id: 'area12', url: new URL(featureLoaderUrl + '?type=area&vaylaluokka=1,2'), staticUrl: new URL(staticUrl + '/area12.json.gz') },
  { id: 'area3456', url: new URL(featureLoaderUrl + '?type=area&vaylaluokka=3,4,5,6'), staticUrl: new URL(staticUrl + '/area3456.json.gz') },
  { id: 'line12', url: new URL(featureLoaderUrl + '?type=line&vaylaluokka=1,2'), staticUrl: new URL(staticUrl + '/line12.json.gz') },
  { id: 'line3456', url: new URL(featureLoaderUrl + '?type=line&vaylaluokka=3,4,5,6'), staticUrl: new URL(staticUrl + '/line3456.json.gz') },
  {
    id: 'restrictionarea',
    url: new URL(featureLoaderUrl + '?type=restrictionarea&vaylaluokka=1,2'),
    staticUrl: new URL(staticUrl + '/restrictionarea.json.gz'),
  },
  {
    id: 'specialarea2',
    url: new URL(featureLoaderUrl + '?type=specialarea2&vaylaluokka=1,2,3,4,5,6'),
    staticUrl: new URL(staticUrl + '/specialarea2.json.gz'),
  },
  {
    id: 'specialarea15',
    url: new URL(featureLoaderUrl + '?type=specialarea15&vaylaluokka=1,2,3,4,5,6'),
    staticUrl: new URL(staticUrl + '/specialarea15.json.gz'),
  },
  { id: 'pilot', url: new URL(featureLoaderUrl + '?type=pilot'), staticUrl: new URL(staticUrl + '/pilot.json.gz') },
  { id: 'harbor', url: new URL(featureLoaderUrl + '?type=harbor'), staticUrl: new URL(staticUrl + '/harbor.json.gz') },
  {
    id: 'safetyequipment',
    url: new URL(featureLoaderUrl + '?type=safetyequipment&vaylaluokka=1,2,99'),
    staticUrl: new URL(staticUrl + '/safetyequipment.json.gz'),
  },
  { id: 'depth12', url: new URL(featureLoaderUrl + '?type=depth&vaylaluokka=1,2'), staticUrl: new URL(staticUrl + '/depth12.json.gz') },
  {
    id: 'safetyequipmentfault',
    url: new URL(featureLoaderUrl + '?type=safetyequipmentfault'),
    staticUrl: new URL(staticUrl + '/safetyequipmentfault.json.gz'),
  },
  { id: 'marinewarning', url: new URL(featureLoaderUrl + '?type=marinewarning'), staticUrl: new URL(staticUrl + '/marinewarning.json.gz') },
  { id: 'name', url: new URL(staticUrl + '/names.json.gz') },
  { id: 'balticsea', url: new URL(staticUrl + '/balticsea.json.gz') },
  { id: 'finland', url: new URL(staticUrl + '/finland.json.gz') },
  { id: 'mml_meri', url: new URL(staticUrl + '/mml-meri.json.gz') },
  { id: 'mml_jarvi', url: new URL(staticUrl + '/mml-jarvi-20230505.json.gz') },
  { id: 'mml_laiturit', url: new URL(staticUrl + '/mml-laiturit.json.gz') },
  { id: 'boardline12', url: new URL(featureLoaderUrl + '?type=boardline&vaylaluokka=1,2'), staticUrl: new URL(staticUrl + '/boardline12.json.gz') },
  { id: 'mareograph', url: new URL(featureLoaderUrl + '?type=mareograph'), staticUrl: new URL(staticUrl + '/mareograph.json.gz') },
  { id: 'observation', url: new URL(featureLoaderUrl + '?type=observation'), staticUrl: new URL(staticUrl + '/observation.json.gz') },
  { id: 'buoy', url: new URL(featureLoaderUrl + '?type=buoy'), staticUrl: new URL(staticUrl + '/buoy.json.gz') },
  { id: 'vtsline', url: new URL(featureLoaderUrl + '?type=vtsline'), staticUrl: new URL(staticUrl + '/vtsline.json.gz') },
  { id: 'vtspoint', url: new URL(featureLoaderUrl + '?type=vtspoint'), staticUrl: new URL(staticUrl + '/vtspoint.json.gz') },
  { id: 'circle', url: new URL(featureLoaderUrl + '?type=circle'), staticUrl: new URL(staticUrl + '/circle.json.gz') },
];

export type FeatureDataMainLayerId = 'merchant' | 'othertraffic' | 'conditions' | 'vts' | 'depths';

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
  | 'depth12'
  | 'marinewarning'
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
  | 'specialarea15';

export type SelectedFairwayCardLayerId = 'selectedfairwaycard';
export type FairwayWidthLayerId = 'fairwaywidth';

export type FeatureLayerId = FeatureDataLayerId | SelectedFairwayCardLayerId | FairwayWidthLayerId;

export type Lang = 'fi' | 'sv' | 'en';

type DataLayer = { id: FeatureDataLayerId; noOfflineSupport?: boolean };

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
    { id: 'area12' },
    { id: 'area3456' },
    { id: 'line12' },
    { id: 'line3456' },
    { id: 'speedlimit' },
    { id: 'specialarea2' },
    { id: 'specialarea15' },
    { id: 'pilot' },
    { id: 'harbor' },
    { id: 'safetyequipment' },
    { id: 'depth12' },
    { id: 'marinewarning' },
    { id: 'boardline12' },
    { id: 'mareograph', noOfflineSupport: true },
    { id: 'ice', noOfflineSupport: true },
    { id: 'observation', noOfflineSupport: true },
    { id: 'buoy', noOfflineSupport: true },
    { id: 'vtsline' },
    { id: 'vtspoint' },
    { id: 'name' },
    { id: 'soundingpoint', noOfflineSupport: true },
    { id: 'depthcontour', noOfflineSupport: true },
    { id: 'deptharea', noOfflineSupport: true },
    { id: 'circle' },
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
  name: 'DVK',
  storeName: 'react-query-data',
  staleTime: 2 * 60 * 60 * 1000, // 2 hours between server queries
  cacheTime: 24 * 24 * 60 * 60 * 1000, // 24 days between local cache carbage collection
  staleTimeStatic: 50 * 24 * 60 * 60 * 1000, // 50 days for static s3 resources
  cacheTimeStatic: 60 * 24 * 60 * 60 * 1000, // 60 days for static s3 resources
};
