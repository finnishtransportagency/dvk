const featureLoaderUrl = process.env.REACT_APP_REST_API_URL
  ? process.env.REACT_APP_REST_API_URL + '/featureloader'
  : window.location.origin + '/api/featureloader';

const staticUrl = process.env.REACT_APP_STATIC_URL ? `https://${process.env.REACT_APP_STATIC_URL}/geotiff` : window.location.origin + '/geotiff';

export type FeatureDataId =
  | 'area12'
  | 'area3456'
  | 'line12'
  | 'line3456'
  | 'restrictionarea'
  | 'specialarea'
  | 'pilot'
  | 'harbor'
  | 'safetyequipment'
  | 'depth12'
  | 'safetyequipmentfault'
  | 'marinewarning'
  | 'seaname'
  | 'groundname'
  | 'boardline12';

export type FeatureDataSource = { id: FeatureDataId; url: URL };

export const FeatureDataSources: Array<FeatureDataSource> = [
  { id: 'area12', url: new URL(featureLoaderUrl + '?type=area&vaylaluokka=1,2') },
  { id: 'area3456', url: new URL(featureLoaderUrl + '?type=area&vaylaluokka=3,4,5,6') },
  { id: 'line12', url: new URL(featureLoaderUrl + '?type=line&vaylaluokka=1,2') },
  { id: 'line3456', url: new URL(featureLoaderUrl + '?type=line&vaylaluokka=3,4,5,6') },
  { id: 'restrictionarea', url: new URL(featureLoaderUrl + '?type=restrictionarea&vaylaluokka=1,2') },
  { id: 'specialarea', url: new URL(featureLoaderUrl + '?type=specialarea&vaylaluokka=1,2,3,4,5,6') },
  { id: 'pilot', url: new URL(featureLoaderUrl + '?type=pilot') },
  { id: 'harbor', url: new URL(featureLoaderUrl + '?type=harbor') },
  { id: 'safetyequipment', url: new URL(featureLoaderUrl + '?type=safetyequipment&vaylaluokka=1,2,99') },
  { id: 'depth12', url: new URL(featureLoaderUrl + '?type=depth&vaylaluokka=1,2') },
  { id: 'safetyequipmentfault', url: new URL(featureLoaderUrl + '?type=safetyequipmentfault') },
  { id: 'marinewarning', url: new URL(featureLoaderUrl + '?type=marinewarning') },
  { id: 'seaname', url: new URL(staticUrl + '/vesisto_nimet.json') },
  { id: 'groundname', url: new URL(staticUrl + '/maa_nimet.json') },
  { id: 'boardline12', url: new URL(featureLoaderUrl + '?type=boardline&vaylaluokka=1,2') },
];

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
  | 'boardline12';

export type SelectedFairwayCardLayerId = 'selectedfairwaycard';

export type FeatureLayerId = FeatureDataLayerId | SelectedFairwayCardLayerId;

export type Lang = 'fi' | 'sv' | 'en';

type DataLayer = { id: FeatureDataLayerId };

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
    { id: 'specialarea' },
    { id: 'pilot' },
    { id: 'harbor' },
    { id: 'safetyequipment' },
    { id: 'depth12' },
    { id: 'marinewarning' },
    { id: 'boardline12' },
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
  staleTime: 2 * 60 * 60 * 1000, // 2 hours
  cacheTime: 5 * 60 * 60 * 1000, // 5 hours
};
