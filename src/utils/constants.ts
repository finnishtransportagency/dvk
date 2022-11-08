const featureLoaderUrl = process.env.REACT_APP_REST_API_URL
  ? process.env.REACT_APP_REST_API_URL + '/featureloader'
  : window.location.origin + '/api/featureloader';

export type FeatureLayerIdType =
  | 'area12'
  | 'area3456'
  | 'line12'
  | 'line3456'
  | 'restrictionarea'
  | 'specialarea'
  | 'pilot'
  | 'harbor'
  | 'safetyequipment';

type MapType = {
  EPSG: string;
  EXTENT: number[];
  RESOLUTIONS: number[];
  INIT_CENTER: number[];
  INIT_RESOLUTION: number;
  FEATURE_LAYERS: Array<{ id: FeatureLayerIdType; url: URL }>;
};

export const MAP: MapType = {
  EPSG: 'EPSG:3067',
  EXTENT: [61000, 6605000, 733000, 7777000],
  RESOLUTIONS: [2048, 1024, 512, 256, 128, 64, 32, 16, 8, 4, 2, 1, 0.5],
  INIT_CENTER: [384920, 6671856],
  INIT_RESOLUTION: 128,
  FEATURE_LAYERS: [
    { id: 'area12', url: new URL(featureLoaderUrl + '?type=area&vaylaluokka=1,2') },
    { id: 'area3456', url: new URL(featureLoaderUrl + '?type=area&vaylaluokka=3,4,5,6') },
    { id: 'line12', url: new URL(featureLoaderUrl + '?type=line&vaylaluokka=1,2') },
    { id: 'line3456', url: new URL(featureLoaderUrl + '?type=line&vaylaluokka=3,4,5,6') },
    { id: 'restrictionarea', url: new URL(featureLoaderUrl + '?type=restrictionarea&vaylaluokka=1,2') },
    { id: 'specialarea', url: new URL(featureLoaderUrl + '?type=specialarea&vaylaluokka=1,2,3,4,5,6') },
    { id: 'pilot', url: new URL(featureLoaderUrl + '?type=pilot') },
    { id: 'harbor', url: new URL(featureLoaderUrl + '?type=harbor') },
    { id: 'safetyequipment', url: new URL(featureLoaderUrl + '?type=safetyequipment&vaylaluokka=1,2,99') },
  ],
};

export const MINIMUM_QUERYLENGTH = 3;
export const MAX_HITS = 20;
