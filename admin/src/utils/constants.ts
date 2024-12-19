import { GeometryPoint, PictureInput, PilotPlaceInput, Text, TextInput } from '../graphql/generated';

export enum FairwayForm {
  OpenWater = 1,
  Channel = 2,
  SlopedChannel = 3,
}

export const VERSION = {
  PUBLIC: 'v0_public',
  LATEST: 'v0_latest',
};

export type Lang = 'fi' | 'sv' | 'en';

export type ItemType = '' | 'CARD' | 'HARBOR';

export type ConfirmationType = '' | 'archive' | 'cancel' | 'preview' | 'publish' | 'remove' | 'version' | 'changeVersion';

export type ValidationType = {
  id: string;
  msg: string;
};

export type ErrorMessageType = {
  required: string;
  invalid: string;
  duplicateId: string;
  endDateError: string;
  duplicateLocation: string;
};
export const ErrorMessageKeys: ErrorMessageType = {
  required: 'general.required-field',
  invalid: 'general.check-input',
  duplicateId: 'fairwaycard.error-duplicate-id',
  endDateError: 'general.end-date-error',
  duplicateLocation: 'harbour.error-duplicate-location',
};

export type ValueType = boolean | number | string | number[] | string[] | PilotPlaceInput[] | PictureInput[];

export type HarbourActionType =
  | 'name'
  | 'primaryId'
  | 'extraInfo'
  | 'cargo'
  | 'harbourBasin'
  | 'companyName'
  | 'email'
  | 'phoneNumber'
  | 'fax'
  | 'internet'
  | 'lat'
  | 'lon'
  | 'quay'
  | 'quayName'
  | 'quayLength'
  | 'quayLat'
  | 'quayLon'
  | 'quayExtraInfo'
  | 'section'
  | 'sectionName'
  | 'sectionDepth'
  | 'sectionLat'
  | 'sectionLon'
  | 'publishDetails';

export type FairwayCardSquatCalculationActionType =
  | 'squatCalculations'
  | 'squatCalculationPlace'
  | 'squatCalculationAdditionalInformation'
  | 'squatTargetFairwayIds'
  | 'squatSuitableFairwayAreaIds'
  | 'squatCalculationDepth'
  | 'squatCalculationFairwayForm'
  | 'squatCalculationEstimatedWaterDepth'
  | 'squatCalculationFairwayWidth'
  | 'squatCalculationSlopeScale'
  | 'squatCalculationSlopeHeight';

export type FairwayCardActionType =
  | 'name'
  | 'primaryId'
  | 'line'
  | 'speedLimit'
  | 'designSpeed'
  | 'anchorage'
  | 'navigationCondition'
  | 'iceCondition'
  | 'windRecommendation'
  | 'vesselRecommendation'
  | 'visibility'
  | 'mareographs'
  | 'pilotEmail'
  | 'pilotExtraInfo'
  | 'pilotPhone'
  | 'pilotFax'
  | 'pilotJourney'
  | 'vts'
  | 'vtsName'
  | 'vtsPhone'
  | 'vtsEmail'
  | 'tug'
  | 'tugName'
  | 'tugPhone'
  | 'tugEmail'
  | 'tugFax'
  | 'vhf'
  | 'vhfName'
  | 'vhfChannel'
  | 'picture'
  | 'pictureDescription'
  | 'pictureLegendPosition'
  | 'getState'
  | 'additionalInfo'
  | 'pilotRoutes'
  | 'temporaryNotifications'
  | 'temporaryNotificationContent'
  | 'temporaryNotificationStartDate'
  | 'temporaryNotificationEndDate'
  | 'publishDetails'
  | FairwayCardSquatCalculationActionType;

export type FairwayCardActionTypeSelect =
  | 'fairwayIds'
  | 'fairwayPrimary'
  | 'fairwaySecondary'
  | 'harbours'
  | 'status'
  | 'referenceLevel'
  | 'group'
  | 'pilotPlaces';

export type EmptyActionTypeSelect = 'empty';

export type ActionType = HarbourActionType | FairwayCardActionType | FairwayCardActionTypeSelect | EmptyActionTypeSelect;

export type SelectOption = {
  id: number | string | boolean;
  name?: Text | null;
  geometry?: GeometryPoint | null;
};

export type AreaSelectOption = SelectOption & {
  fairwayIds?: number[] | null;
  depth?: number;
  subtext?: string;
  areatype?: number;
};

export type PictureGroup = {
  groupId: number;
  text: TextInput;
};

export const locales = ['fi', 'sv', 'en'];

export const INPUT_MAXLENGTH = 200;
export const TEXTAREA_MAXLENGTH = 2000;

// Map export related

const featureLoaderUrl = import.meta.env.VITE_APP_REST_API_URL
  ? import.meta.env.VITE_APP_REST_API_URL + '/featureloader'
  : globalThis.location.origin + '/api/featureloader';

const staticUrl = import.meta.env.VITE_APP_STATIC_URL
  ? `https://${import.meta.env.VITE_APP_STATIC_URL}/s3static`
  : globalThis.location.origin + '/s3static';

const pilotRoutesUrl = import.meta.env.VITE_APP_REST_API_URL
  ? import.meta.env.VITE_APP_REST_API_URL + '/pilotroutes'
  : globalThis.location.origin + '/api/pilotroutes';

export const imageUrl = import.meta.env.VITE_APP_IMAGE_URL ? import.meta.env.VITE_APP_IMAGE_URL : globalThis.location.origin + '/s3static/';

export type BackgroundLayerId = 'finland' | 'balticsea' | 'mml_satamat';

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
  | 'name'
  | 'boardline12'
  | 'balticsea'
  | 'finland'
  | 'mml_satamat'
  | 'vtsline'
  | 'vtspoint'
  | 'circle'
  | 'specialarea2'
  | 'specialarea15'
  | 'pilotroute'
  | 'pilotageareaborder'
  | 'pilotagelimit'
  | 'forecast';

export type FeatureDataProjection = 'EPSG:3067' | 'EPSG:4326' | 'EPSG:3395' | 'EPSG:4258';

export type FeatureDataSource = { id: FeatureDataId; projection: FeatureDataProjection; url: URL; staticUrl?: URL };

export const FeatureDataSources: Array<FeatureDataSource> = [
  {
    id: 'area12',
    projection: 'EPSG:4326',
    url: new URL(featureLoaderUrl + '?type=area&vaylaluokka=1,2'),
    staticUrl: new URL(staticUrl + '/area12.json.gz'),
  },
  {
    id: 'area3456',
    projection: 'EPSG:4326',
    url: new URL(featureLoaderUrl + '?type=area&vaylaluokka=3,4,5,6'),
    staticUrl: new URL(staticUrl + '/area3456.json.gz'),
  },
  {
    id: 'line12',
    projection: 'EPSG:4326',
    url: new URL(featureLoaderUrl + '?type=line&vaylaluokka=1,2'),
    staticUrl: new URL(staticUrl + '/line12.json.gz'),
  },
  {
    id: 'line3456',
    projection: 'EPSG:4326',
    url: new URL(featureLoaderUrl + '?type=line&vaylaluokka=3,4,5,6'),
    staticUrl: new URL(staticUrl + '/line3456.json.gz'),
  },
  {
    id: 'restrictionarea',
    projection: 'EPSG:4326',
    url: new URL(featureLoaderUrl + '?type=restrictionarea&vaylaluokka=1,2'),
    staticUrl: new URL(staticUrl + '/restrictionarea.json.gz'),
  },
  {
    id: 'specialarea2',
    projection: 'EPSG:4326',
    url: new URL(featureLoaderUrl + '?type=specialarea2&vaylaluokka=1,2,3,4,5,6'),
    staticUrl: new URL(staticUrl + '/specialarea2.json.gz'),
  },
  {
    id: 'specialarea15',
    projection: 'EPSG:3067',
    url: new URL(featureLoaderUrl + '?type=specialarea15&vaylaluokka=1,2,3,4,5,6'),
    staticUrl: new URL(staticUrl + '/specialarea15.json.gz'),
  },
  { id: 'pilot', projection: 'EPSG:4258', url: new URL(featureLoaderUrl + '?type=pilot'), staticUrl: new URL(staticUrl + '/pilot.json.gz') },
  { id: 'harbor', projection: 'EPSG:4326', url: new URL(featureLoaderUrl + '?type=harbor'), staticUrl: new URL(staticUrl + '/harbor.json.gz') },
  {
    id: 'safetyequipment',
    projection: 'EPSG:4326',
    url: new URL(featureLoaderUrl + '?type=safetyequipment&vaylaluokka=1,2,99'),
    staticUrl: new URL(staticUrl + '/safetyequipment.json.gz'),
  },
  {
    id: 'depth12',
    projection: 'EPSG:4326',
    url: new URL(featureLoaderUrl + '?type=depth&vaylaluokka=1,2'),
    staticUrl: new URL(staticUrl + '/depth12.json.gz'),
  },
  { id: 'name', projection: 'EPSG:3067', url: new URL(staticUrl + '/names.json.gz') },
  { id: 'balticsea', projection: 'EPSG:3067', url: new URL(staticUrl + '/balticsea.json.gz') },
  { id: 'finland', projection: 'EPSG:3067', url: new URL(staticUrl + '/finland.json.gz') },
  { id: 'mml_satamat', projection: 'EPSG:3067', url: new URL(staticUrl + '/mml-satamat-20240719.json.gz') },
  {
    id: 'boardline12',
    projection: 'EPSG:4326',
    url: new URL(featureLoaderUrl + '?type=boardline&vaylaluokka=1,2'),
    staticUrl: new URL(staticUrl + '/boardline12.json.gz'),
  },
  { id: 'vtsline', projection: 'EPSG:4258', url: new URL(featureLoaderUrl + '?type=vtsline'), staticUrl: new URL(staticUrl + '/vtsline.json.gz') },
  { id: 'vtspoint', projection: 'EPSG:4258', url: new URL(featureLoaderUrl + '?type=vtspoint'), staticUrl: new URL(staticUrl + '/vtspoint.json.gz') },
  { id: 'circle', projection: 'EPSG:4326', url: new URL(featureLoaderUrl + '?type=circle'), staticUrl: new URL(staticUrl + '/circle.json.gz') },
  { id: 'pilotroute', projection: 'EPSG:4326', url: new URL(pilotRoutesUrl), staticUrl: new URL(staticUrl + '//pilotroutes.json.gz') },
  {
    id: 'pilotageareaborder',
    projection: 'EPSG:3067',
    url: new URL(staticUrl + '/luotsinkayttoalueenreuna.json.gz'),
    staticUrl: new URL(staticUrl + '/luotsinkayttoalueenreuna.json.gz'),
  },
  {
    id: 'pilotagelimit',
    projection: 'EPSG:3067',
    url: new URL(staticUrl + '/luotsinkayttolinjat.json.gz'),
    staticUrl: new URL(staticUrl + '/luotsinkayttolinjat.json.gz'),
  },
];

export type FeatureDataMainLayerId = 'merchant' | 'othertraffic' | 'vts' | 'piloting' | 'specialarea';

export type FeatureDataLayerId =
  | 'area12'
  | 'area3456'
  | 'line12'
  | 'line3456'
  | 'speedlimit'
  | 'pilot'
  | 'harbor'
  | 'quay'
  | 'safetyequipment'
  | 'depth12'
  | 'name'
  | 'boardline12'
  | 'vtsline'
  | 'vtspoint'
  | 'circle'
  | 'specialarea2'
  | 'specialarea15'
  | 'pilotroute'
  | 'pilotageareaborder'
  | 'pilotagelimit';

export type SelectedFairwayCardLayerId = 'selectedfairwaycard';

export type FeatureLayerId = FeatureDataLayerId | SelectedFairwayCardLayerId;

type DataLayer = { id: FeatureDataLayerId; noOfflineSupport?: boolean };

type MapPrintOptType = {
  SCALE: number;
  EXPORT_WIDTH: number;
  EXPORT_HEIGHT: number;
  VIEW_WIDTH: number;
  VIEW_HEIGHT: number;
};

type MapType = {
  EPSG: string;
  EXTENT: number[];
  RESOLUTIONS: number[];
  INIT_CENTER: number[];
  INIT_RESOLUTION: number;
  FEATURE_DATA_LAYERS: Array<DataLayer>;
  PRINT: MapPrintOptType;
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
    { id: 'harbor' },
    { id: 'safetyequipment' },
    { id: 'depth12' },
    { id: 'boardline12' },
    { id: 'vtsline' },
    { id: 'vtspoint' },
    { id: 'pilot' },
    { id: 'pilotroute' },
    { id: 'pilotagelimit' },
    { id: 'pilotageareaborder' },
    { id: 'name' },
    { id: 'circle' },
  ],
  PRINT: { SCALE: 1.7, EXPORT_WIDTH: 794, EXPORT_HEIGHT: 1123, VIEW_WIDTH: 794 / 1.7 + 53, VIEW_HEIGHT: 1123 / 1.7 + 59.5 }, // A4 @ 96 DPI: 794 x 1123
};

export const POSITION = {
  bottomLeft: 'bottomLeft',
  topLeft: 'topLeft',
  topRight: 'topRight',
  bottomRight: 'bottomRight',
};

export type DropdownType = 'filter' | 'sequence';
