import { Maybe } from '../graphql/generated';

export const APP_CONFIG_DVK = 'DVK';
export const APP_CONFIG_PREVIEW = 'PREVIEW';

const featureLoaderUrl = import.meta.env.VITE_APP_REST_API_URL
  ? import.meta.env.VITE_APP_REST_API_URL + '/featureloader'
  : globalThis.location.origin + '/api/featureloader';

const aisVesselsUrl = import.meta.env.VITE_APP_REST_API_URL
  ? import.meta.env.VITE_APP_REST_API_URL + '/aisvessels'
  : globalThis.location.origin + '/api/aisvessels';

const aisLocationsUrl = import.meta.env.VITE_APP_REST_API_URL
  ? import.meta.env.VITE_APP_REST_API_URL + '/aislocations'
  : globalThis.location.origin + '/api/aislocations';

const pilotRoutesUrl = import.meta.env.VITE_APP_REST_API_URL
  ? import.meta.env.VITE_APP_REST_API_URL + '/pilotroutes'
  : globalThis.location.origin + '/api/pilotroutes';

const dirwaysUrl = import.meta.env.VITE_APP_REST_API_URL
  ? import.meta.env.VITE_APP_REST_API_URL + '/dirways'
  : globalThis.location.origin + '/api/dirways';

const restrictionPortUrl = import.meta.env.VITE_APP_REST_API_URL
  ? import.meta.env.VITE_APP_REST_API_URL + '/restrictions'
  : globalThis.location.origin + '/api/restrictions';

const staticUrl = import.meta.env.VITE_APP_STATIC_URL
  ? `https://${import.meta.env.VITE_APP_STATIC_URL}/s3static`
  : globalThis.location.origin + '/s3static';

export const imageUrl = import.meta.env.VITE_APP_IMAGE_URL ? import.meta.env.VITE_APP_IMAGE_URL : globalThis.location.origin + '/s3static/';

export const accessibilityUrl = {
  fi: 'https://vayla.fi/tietoa-meista/yhteystiedot/saavutettavuus/digitaalinen-vaylakortti',
  sv: 'https://vayla.fi/sv/trafikledsverket/kontaktuppgifter/tillganglighet/digital-farledskort',
  en: 'https://vayla.fi/en/about/contact-information/accessibility/digital-fairway-card',
};

export const OFFLINE_STORAGE = {
  gcTime: 30 * 1000, // 30 seconds to clean from memory
  staleTime: 2 * 60 * 60 * 1000, // 2 hours before data is stale
  cacheTime: 24 * 24 * 60 * 60 * 1000, // 24 days between local cache (IndexedDB) carbage collection
  staleTimeStatic: 50 * 24 * 60 * 60 * 1000, // 50 days for static s3 resources
  cacheTimeStatic: 60 * 24 * 60 * 60 * 1000, // 60 days for static s3 resources
};

export type BackgroundLayerId =
  | 'finland'
  | 'mml_meri'
  | 'mml_meri_rantaviiva'
  | 'mml_jarvi'
  | 'mml_jarvi_rantaviiva'
  | 'mml_satamat'
  | 'mml_laiturit'
  | 'balticsea';

export type StaticFeatureDataId =
  | 'balticsea'
  | 'finland'
  | 'mml_meri'
  | 'mml_meri_rantaviiva'
  | 'mml_jarvi'
  | 'mml_jarvi_rantaviiva'
  | 'mml_satamat'
  | 'mml_laiturit';

export type FeatureDataId =
  | 'area12'
  | 'area3456'
  | 'line12'
  | 'line3456'
  | 'restrictionarea'
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
  | 'aisvessel'
  | 'vayla_water_area'
  | 'pilotroute'
  | 'pilot'
  | 'pilotageareaborder'
  | 'pilotagelimit'
  | 'dirway'
  | 'restrictionport'
  | 'name';

export type StaticFeatureDataSource = { id: StaticFeatureDataId; url: URL };

export const StaticFeatureDataSources: Array<StaticFeatureDataSource> = [
  { id: 'balticsea', url: new URL(staticUrl + '/balticsea.json.gz') },
  { id: 'finland', url: new URL(staticUrl + '/finland.json.gz') },
  { id: 'mml_meri', url: new URL(staticUrl + '/mml-meri-20240724.json.gz') },
  { id: 'mml_meri_rantaviiva', url: new URL(staticUrl + '/mml-meri-rantaviiva-20240724.json.gz') },
  { id: 'mml_jarvi', url: new URL(staticUrl + '/mml-jarvi-20240724.json.gz') },
  { id: 'mml_jarvi_rantaviiva', url: new URL(staticUrl + '/mml-jarvi-rantaviiva-20240724.json.gz') },
  { id: 'mml_satamat', url: new URL(staticUrl + '/mml-satamat-20240719.json.gz') },
  { id: 'mml_laiturit', url: new URL(staticUrl + '/mml-laiturit-20240719.json.gz') },
];

export type FeatureDataProjection = 'EPSG:3067' | 'EPSG:4326' | 'EPSG:3395' | 'EPSG:4258';

export type FeatureDataSource = {
  id: FeatureDataId;
  projection: FeatureDataProjection;
  url: URL;
  staticUrl: URL;
  persist: boolean;
  staleTime: number;
  gcTime: number;
  refetchInterval: number | false;
  refetchOnMount: boolean | 'always';
};

export const FeatureDataSources: Array<FeatureDataSource> = [
  {
    id: 'area12',
    projection: 'EPSG:4326',
    url: new URL(featureLoaderUrl + '?type=area&vaylaluokka=1,2'),
    staticUrl: new URL(staticUrl + '/area12.json.gz'),
    persist: true,
    staleTime: OFFLINE_STORAGE.staleTime,
    gcTime: OFFLINE_STORAGE.gcTime,
    refetchInterval: 2 * 60 * 60 * 1000, // 2 hours
    refetchOnMount: true,
  },
  {
    id: 'area3456',
    projection: 'EPSG:4326',
    url: new URL(featureLoaderUrl + '?type=area&vaylaluokka=3,4,5,6'),
    staticUrl: new URL(staticUrl + '/area3456.json.gz'),
    persist: true,
    staleTime: OFFLINE_STORAGE.staleTime,
    gcTime: OFFLINE_STORAGE.gcTime,
    refetchInterval: 6 * 60 * 60 * 1000, // 6 hours
    refetchOnMount: true,
  },
  {
    id: 'line12',
    projection: 'EPSG:4326',
    url: new URL(featureLoaderUrl + '?type=line&vaylaluokka=1,2'),
    staticUrl: new URL(staticUrl + '/line12.json.gz'),
    persist: true,
    staleTime: OFFLINE_STORAGE.staleTime,
    gcTime: OFFLINE_STORAGE.gcTime,
    refetchInterval: 2 * 60 * 60 * 1000, // 2 hours
    refetchOnMount: true,
  },
  {
    id: 'line3456',
    projection: 'EPSG:4326',
    url: new URL(featureLoaderUrl + '?type=line&vaylaluokka=3,4,5,6'),
    staticUrl: new URL(staticUrl + '/line3456.json.gz'),
    persist: true,
    staleTime: OFFLINE_STORAGE.staleTime,
    gcTime: OFFLINE_STORAGE.gcTime,
    refetchInterval: 6 * 60 * 60 * 1000, // 6 hours
    refetchOnMount: true,
  },
  {
    id: 'restrictionarea',
    projection: 'EPSG:4326',
    url: new URL(featureLoaderUrl + '?type=restrictionarea&vaylaluokka=1,2'),
    staticUrl: new URL(staticUrl + '/restrictionarea.json.gz'),
    persist: true,
    staleTime: OFFLINE_STORAGE.staleTime,
    gcTime: OFFLINE_STORAGE.gcTime,
    refetchInterval: 2 * 60 * 60 * 1000, // 2 hours
    refetchOnMount: true,
  },
  {
    id: 'specialarea2',
    projection: 'EPSG:4326',
    url: new URL(featureLoaderUrl + '?type=specialarea2&vaylaluokka=1,2,3,4,5,6'),
    staticUrl: new URL(staticUrl + '/specialarea2.json.gz'),
    persist: true,
    staleTime: OFFLINE_STORAGE.staleTime,
    gcTime: OFFLINE_STORAGE.gcTime,
    refetchInterval: 2 * 60 * 60 * 1000, // 2 hours
    refetchOnMount: true,
  },
  {
    id: 'specialarea15',
    projection: 'EPSG:3067',
    url: new URL(featureLoaderUrl + '?type=specialarea15&vaylaluokka=1,2,3,4,5,6'),
    staticUrl: new URL(staticUrl + '/specialarea15.json.gz'),
    persist: true,
    staleTime: OFFLINE_STORAGE.staleTime,
    gcTime: OFFLINE_STORAGE.gcTime,
    refetchInterval: 2 * 60 * 60 * 1000, // 2 hours
    refetchOnMount: true,
  },
  {
    id: 'harbor',
    projection: 'EPSG:4326',
    url: new URL(featureLoaderUrl + '?type=harbor'),
    staticUrl: new URL(staticUrl + '/harbor.json.gz'),
    persist: true,
    staleTime: OFFLINE_STORAGE.staleTime,
    gcTime: OFFLINE_STORAGE.gcTime,
    refetchInterval: 2 * 60 * 60 * 1000, // 2 hours
    refetchOnMount: true,
  },
  {
    id: 'safetyequipment',
    projection: 'EPSG:4326',
    url: new URL(featureLoaderUrl + '?type=safetyequipment&vaylaluokka=1,2,99'),
    staticUrl: new URL(staticUrl + '/safetyequipment.json.gz'),
    persist: true,
    staleTime: OFFLINE_STORAGE.staleTime,
    gcTime: OFFLINE_STORAGE.gcTime,
    refetchInterval: 2 * 60 * 60 * 1000, // 2 hours
    refetchOnMount: true,
  },
  {
    id: 'depth12',
    projection: 'EPSG:4326',
    url: new URL(featureLoaderUrl + '?type=depth&vaylaluokka=1,2'),
    staticUrl: new URL(staticUrl + '/depth12.json.gz'),
    persist: true,
    staleTime: OFFLINE_STORAGE.staleTime,
    gcTime: OFFLINE_STORAGE.gcTime,
    refetchInterval: 2 * 60 * 60 * 1000, // 2 hours
    refetchOnMount: true,
  },
  {
    id: 'safetyequipmentfault',
    projection: 'EPSG:4326',
    url: new URL(featureLoaderUrl + '?type=safetyequipmentfault'),
    staticUrl: new URL(staticUrl + '/safetyequipmentfault.json.gz'),
    persist: true,
    staleTime: OFFLINE_STORAGE.staleTime,
    gcTime: OFFLINE_STORAGE.gcTime,
    refetchInterval: 1000 * 60 * 15, // 15 minutes
    refetchOnMount: true,
  },
  {
    id: 'marinewarning',
    projection: 'EPSG:3395',
    url: new URL(featureLoaderUrl + '?type=marinewarning'),
    staticUrl: new URL(staticUrl + '/marinewarning.json.gz'),
    persist: true,
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: OFFLINE_STORAGE.gcTime,
    refetchInterval: 1000 * 60 * 15, // 15 minutes
    refetchOnMount: 'always',
  },
  {
    id: 'boardline12',
    projection: 'EPSG:4326',
    url: new URL(featureLoaderUrl + '?type=boardline&vaylaluokka=1,2'),
    staticUrl: new URL(staticUrl + '/boardline12.json.gz'),
    persist: true,
    staleTime: OFFLINE_STORAGE.staleTime,
    gcTime: OFFLINE_STORAGE.gcTime,
    refetchInterval: 2 * 60 * 60 * 1000, // 2 hours
    refetchOnMount: true,
  },
  {
    id: 'mareograph',
    projection: 'EPSG:4258',
    url: new URL(featureLoaderUrl + '?type=mareograph'),
    staticUrl: new URL(staticUrl + '/mareograph.json.gz'),
    persist: false,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 60 * 1000, // 1 minute
    refetchInterval: 1000 * 60 * 5, // 5 minutes
    refetchOnMount: 'always',
  },
  {
    id: 'observation',
    projection: 'EPSG:4258',
    url: new URL(featureLoaderUrl + '?type=observation'),
    staticUrl: new URL(staticUrl + '/observation.json.gz'),
    persist: true,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 60 * 1000, // 1 minute
    refetchInterval: 1000 * 60 * 5, // 5 minutes
    refetchOnMount: 'always',
  },
  {
    id: 'buoy',
    projection: 'EPSG:4258',
    url: new URL(featureLoaderUrl + '?type=buoy'),
    staticUrl: new URL(staticUrl + '/buoy.json.gz'),
    persist: false,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 60 * 1000, // 1 minute
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: 'always',
  },
  {
    id: 'vtsline',
    projection: 'EPSG:4258',
    url: new URL(featureLoaderUrl + '?type=vtsline'),
    staticUrl: new URL(staticUrl + '/vtsline.json.gz'),
    persist: true,
    staleTime: OFFLINE_STORAGE.staleTime,
    gcTime: OFFLINE_STORAGE.gcTime,
    refetchInterval: 2 * 60 * 60 * 1000, // 2 hours
    refetchOnMount: true,
  },
  {
    id: 'vtspoint',
    projection: 'EPSG:4258',
    url: new URL(featureLoaderUrl + '?type=vtspoint'),
    staticUrl: new URL(staticUrl + '/vtspoint.json.gz'),
    persist: true,
    staleTime: OFFLINE_STORAGE.staleTime,
    gcTime: OFFLINE_STORAGE.gcTime,
    refetchInterval: 2 * 60 * 60 * 1000, // 2 hours
    refetchOnMount: true,
  },
  {
    id: 'circle',
    projection: 'EPSG:4326',
    url: new URL(featureLoaderUrl + '?type=circle'),
    staticUrl: new URL(staticUrl + '/circle.json.gz'),
    persist: true,
    staleTime: OFFLINE_STORAGE.staleTime,
    gcTime: OFFLINE_STORAGE.gcTime,
    refetchInterval: 2 * 60 * 60 * 1000, // 2 hours
    refetchOnMount: true,
  },
  {
    id: 'aislocation',
    projection: 'EPSG:4326',
    url: new URL(aisLocationsUrl),
    staticUrl: new URL(staticUrl + '/aislocations.json.gz'),
    persist: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 1000, // 10 seconds
    refetchOnMount: true,
  },
  {
    id: 'aisvessel',
    projection: 'EPSG:4326',
    url: new URL(aisVesselsUrl),
    staticUrl: new URL(staticUrl + '/aisvessels.json.gz'),
    persist: false,
    staleTime: 2 * 60 * 60 * 1000, // 2 hours
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
    refetchInterval: 10 * 60 * 1000, // 10 minutes
    refetchOnMount: true,
  },
  {
    id: 'vayla_water_area',
    projection: 'EPSG:3067',
    url: new URL(staticUrl + '/vayla-merialueet.json.gz'),
    staticUrl: new URL(staticUrl + '/vayla-merialueet.json.gz'),
    persist: true,
    staleTime: OFFLINE_STORAGE.staleTime,
    gcTime: OFFLINE_STORAGE.gcTime,
    refetchInterval: 6 * 60 * 60 * 1000, // 6 hours
    refetchOnMount: true,
  },
  {
    id: 'pilot',
    projection: 'EPSG:4258',
    url: new URL(featureLoaderUrl + '?type=pilot'),
    staticUrl: new URL(staticUrl + '/pilot.json.gz'),
    persist: true,
    staleTime: OFFLINE_STORAGE.staleTime,
    gcTime: OFFLINE_STORAGE.gcTime,
    refetchInterval: 2 * 60 * 60 * 1000, // 2 hours
    refetchOnMount: true,
  },
  {
    id: 'pilotroute',
    projection: 'EPSG:4326',
    url: new URL(pilotRoutesUrl),
    staticUrl: new URL(staticUrl + '/pilotroutes.json.gz'),
    persist: true,
    staleTime: OFFLINE_STORAGE.staleTime,
    gcTime: OFFLINE_STORAGE.gcTime,
    refetchInterval: 60 * 60 * 1000, // 1 hour
    refetchOnMount: true,
  },
  {
    id: 'pilotageareaborder',
    projection: 'EPSG:3067',
    url: new URL(staticUrl + '/luotsinkayttoalueenreuna.json.gz'),
    staticUrl: new URL(staticUrl + '/luotsinkayttoalueenreuna.json.gz'),
    persist: true,
    staleTime: OFFLINE_STORAGE.staleTime,
    gcTime: OFFLINE_STORAGE.gcTime,
    refetchInterval: 2 * 60 * 60 * 1000, // 2 hours
    refetchOnMount: true,
  },
  {
    id: 'pilotagelimit',
    projection: 'EPSG:3067',
    url: new URL(staticUrl + '/luotsinkayttolinjat.json.gz'),
    staticUrl: new URL(staticUrl + '/luotsinkayttolinjat.json.gz'),
    persist: true,
    staleTime: OFFLINE_STORAGE.staleTime,
    gcTime: OFFLINE_STORAGE.gcTime,
    refetchInterval: 2 * 60 * 60 * 1000, // 2 hours
    refetchOnMount: true,
  },
  {
    id: 'dirway',
    projection: 'EPSG:4326',
    url: new URL(dirwaysUrl),
    staticUrl: new URL(staticUrl + '/dirways.json.gz'),
    persist: true,
    staleTime: OFFLINE_STORAGE.staleTime,
    gcTime: OFFLINE_STORAGE.gcTime,
    refetchInterval: 2 * 60 * 60 * 1000, // 2 hours
    refetchOnMount: true,
  },
  {
    id: 'restrictionport',
    projection: 'EPSG:4326',
    url: new URL(restrictionPortUrl),
    staticUrl: new URL(staticUrl + '/restrictions.json.gz'),
    persist: true,
    staleTime: OFFLINE_STORAGE.staleTime,
    gcTime: OFFLINE_STORAGE.gcTime,
    refetchInterval: 2 * 60 * 60 * 1000, // 2 hours
    refetchOnMount: true,
  },
  {
    id: 'name',
    projection: 'EPSG:3067',
    url: new URL(staticUrl + '/names.json.gz'),
    staticUrl: new URL(staticUrl + '/names.json.gz'),
    persist: true,
    staleTime: OFFLINE_STORAGE.staleTime,
    gcTime: OFFLINE_STORAGE.gcTime,
    refetchInterval: 6 * 60 * 60 * 1000, // 6 hours
    refetchOnMount: true,
  },
];

export type FeatureDataMainLayerId =
  | 'merchant'
  | 'othertraffic'
  | 'conditions'
  | 'vts'
  | 'depths'
  | 'marinewarning'
  | 'ais'
  | 'piloting'
  | 'specialarea'
  | 'wintertraffic';

export type FeatureDataLayerId =
  | 'area12'
  | 'area3456'
  | 'line12'
  | 'line3456'
  | 'speedlimit'
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
  | 'aisvesselpleasurecraft'
  | 'aisunspecified'
  | 'pilot'
  | 'pilotroute'
  | 'pilotageareaborder'
  | 'pilotagelimit'
  | 'dirway'
  | 'restrictionport'
  | 'ice';

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
    { id: 'harbor', offlineSupport: true, localizedStyle: true },
    { id: 'safetyequipment', offlineSupport: true, localizedStyle: false },
    { id: 'safetyequipmentfault', offlineSupport: true, localizedStyle: false },
    { id: 'depth12', offlineSupport: true, localizedStyle: true },
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
    { id: 'aisvesselpleasurecraft', offlineSupport: false, localizedStyle: false },
    { id: 'aisunspecified', offlineSupport: false, localizedStyle: false },
    { id: 'pilot', offlineSupport: true, localizedStyle: false },
    { id: 'pilotroute', offlineSupport: true, localizedStyle: false },
    { id: 'pilotageareaborder', offlineSupport: true, localizedStyle: false },
    { id: 'pilotagelimit', offlineSupport: true, localizedStyle: false },
    { id: 'dirway', offlineSupport: true, localizedStyle: false },
    { id: 'restrictionport', offlineSupport: true, localizedStyle: false },
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

export const marineWarningLayers: FeatureDataLayerId[] = ['coastalwarning', 'localwarning', 'boaterwarning'];

export type MarineWarningArea =
  | 'seaAreas'
  | 'gulfOfFinland'
  | 'northernBalticSea'
  | 'archipelagoSea'
  | 'seaOfÅland'
  | 'bothnianSea'
  | 'theQuark'
  | 'bayOfBothnia'
  | 'gulfOfBothnia'
  | 'saimaa'
  | 'saimaaCanal'
  | 'inlandAreas';

export type MarineWarningType = 'boaterWarning' | 'coastalWarning' | 'localWarning';

export const aisLayers: FeatureDataLayerId[] = [
  'aisvesselcargo',
  'aisvesseltanker',
  'aisvesselpassenger',
  'aisvesselhighspeed',
  'aisvesseltugandspecialcraft',
  'aisvesselpleasurecraft',
  'aisunspecified',
];

export type WarningFilter = {
  id: MarineWarningArea | MarineWarningType;
  parent?: MarineWarningArea;
  childAreas?: Maybe<Array<WarningFilter>>;
};

export const marineWarningAreasStructure: WarningFilter[] = [
  {
    id: 'seaAreas',
    childAreas: [
      { id: 'gulfOfFinland', parent: 'seaAreas' },
      { id: 'northernBalticSea', parent: 'seaAreas' },
      { id: 'archipelagoSea', parent: 'seaAreas' },
      { id: 'seaOfÅland', parent: 'seaAreas' },
      {
        id: 'gulfOfBothnia',
        parent: 'seaAreas',
        childAreas: [
          { id: 'bothnianSea', parent: 'gulfOfBothnia' },
          { id: 'theQuark', parent: 'gulfOfBothnia' },
          { id: 'bayOfBothnia', parent: 'gulfOfBothnia' },
        ],
      },
    ],
  },
  {
    id: 'inlandAreas',
    childAreas: [
      { id: 'saimaa', parent: 'inlandAreas' },
      { id: 'saimaaCanal', parent: 'inlandAreas' },
    ],
  },
];

export const marineWarningTypeStructure: WarningFilter[] = [{ id: 'boaterWarning' }, { id: 'coastalWarning' }, { id: 'localWarning' }];

export type SafetyEquipmentFaultArea =
  | 'seaAreas'
  | 'gulfOfFinland'
  | 'northernBalticSea'
  | 'archipelagoSea'
  | 'seaOfÅland'
  | 'bothnianSea'
  | 'bayOfBothnia'
  | 'saimaa'
  | 'inlandAreas';

export type SafetyEquipmentFaultFilter = {
  id: SafetyEquipmentFaultArea;
  parent?: SafetyEquipmentFaultArea;
  childAreas?: Maybe<Array<SafetyEquipmentFaultFilter>>;
};

export const equipmentAreasStructure: SafetyEquipmentFaultFilter[] = [
  {
    id: 'seaAreas',
    childAreas: [
      { id: 'gulfOfFinland', parent: 'seaAreas' },
      { id: 'northernBalticSea', parent: 'seaAreas' },
      { id: 'archipelagoSea', parent: 'seaAreas' },
      { id: 'seaOfÅland', parent: 'seaAreas' },
      { id: 'bothnianSea', parent: 'seaAreas' },
      { id: 'bayOfBothnia', parent: 'seaAreas' },
    ],
  },
  {
    id: 'inlandAreas',
    childAreas: [{ id: 'saimaa', parent: 'inlandAreas' }],
  },
];

export const hourInMilliseconds = 3600000;

export const LAYER_IDB_KEY = 'layer-selection';

export const PUBLIC_VERSION = 'v0_public';
