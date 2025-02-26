import { Point } from 'ol/geom';
import { Text } from '../graphql/generated';

export type Card = {
  id: string;
  name: Text;
};

export type HarborFeatureProperties = {
  featureType: string;
  name?: Text;
  email?: string;
  phoneNumber?: string[];
  fax?: string;
  internet?: string;
  quays: number;
  fairwayCards: Card[];
  extraInfo?: Text;
  n2000HeightSystem: boolean;
};

export type QuayFeatureProperties = {
  featureType: string;
  quay?: Text;
  extraInfo?: Text;
  length?: number;
  name?: string;
  depth?: number[];
  showDepth?: boolean;
  email?: string;
  phoneNumber?: string[];
  fax?: string;
  internet?: string;
  n2000HeightSystem: boolean;
};

export type PilotFeatureProperties = {
  name: Text;
};

export type PilotRouteFeatureProperties = {
  id: number;
  identifier: string;
  name: string;
  status: number;
  rtz: string;
  fairwayCards: Card[];
};

export type PilotageLimitFeatureProperties = {
  fid: number;
  numero: number;
  liittyyVayliin: string;
  raja_fi: string;
  raja_sv: string;
  raja_en: string;
};

export type AreaFeatureProperties = {
  id: number;
  isN2000?: boolean;
  typeCode: number;
  type: string;
  name?: string;
  referenceLevel?: string;
  draft?: number;
  depth?: number;
  n2000ReferenceLevel?: string;
  n2000depth?: number;
  n2000draft?: number;
  n2000HeightSystem?: boolean;
  speedLimit?: number | number[];
  extra?: string;
  fairways?: AreaFairway[];
};

export type AreaFairway = {
  fairwayId: number;
  name: Text;
  sizingSpeed?: number;
  sizingSpeed2?: number;
};

export type ProhibitionAreaFeatureProperties = {
  typeCode: number;
  type?: string;
  extraInfo?: Text;
  fairway: AreaFairway;
};

export type LineFairway = {
  fairwayId: number;
  name: Text;
};

export type LineFeatureProperties = {
  id: number;
  featureType: string;
  isN2000?: boolean;
  draft?: number;
  depth?: number;
  length?: number;
  n2000depth?: number;
  n2000draft?: number;
  n2000HeightSystem?: boolean;
  referenceLevel?: string;
  n2000ReferenceLevel?: string;
  direction?: number;
  oppositeDirection?: number;
  extra?: string;
  fairways?: LineFairway[];
};

export type EquipmentFairway = {
  fairwayId: number;
  primary: boolean;
};

export type EquipmentFault = {
  faultId: number;
  faultType: Text;
  faultTypeCode: number;
  recordTime: number;
};

type EquipmentDistance = {
  areaId: number;
  distance: number;
};

export type EquipmentFeatureProperties = {
  id: number;
  featureType: string;
  navigation?: Text;
  navigationCode?: string;
  name?: Text;
  symbol?: string;
  typeCode?: number;
  typeName?: Text;
  lightning: boolean;
  aisType?: number;
  remoteControl?: number;
  fairways?: EquipmentFairway[];
  faults?: EquipmentFault[];
  distances?: EquipmentDistance[];
  fairwayCards?: Card[];
};

export type MarineWarningFeatureProperties = {
  number?: number;
  area?: Text;
  type?: Text;
  location?: Text;
  description?: Text;
  startDateTime?: number;
  endDateTime?: number;
  dateTime?: number;
  notifier?: string;
  equipmentText?: string;
  equipmentId?: number;
  lineText?: string;
  lineId?: number;
  areaText?: string;
  areaId?: number;
};

export type MareographFeatureProperties = {
  name: string;
  waterLevel: number;
  n2000WaterLevel: number;
  dateTime: number;
  calculated: boolean;
};

export type ObservationFeatureProperties = {
  name: string;
  temperature: number;
  windSpeedAvg: number;
  windSpeedMax: number;
  windDirection: number;
  visibility: number | null;
  dateTime: number;
};

export type BuoyFeatureProperties = {
  name: string;
  dateTime: number;
  temperature: number | null;
  waveDirection: number | null;
  waveHeight: number | null;
};

export type VtsFeatureProperties = {
  featureType: 'vtspoint' | 'vtsline';
  identifier: string;
  name?: string;
  information?: string;
  channel?: string;
};

export type AisFeatureProperties = {
  featureType: 'aisvessel';
  mmsi: number;
  sog: number;
  cog: number;
  navStat: number;
  rot: number;
  posAcc: boolean;
  raim: boolean;
  heading?: number;
  timestamp: number;
  timestampExternal: Date;
  dataUpdatedTime: Date;
  name?: string;
  callSign?: string;
  imo?: number;
  shipType?: number;
  draught?: number;
  eta?: number;
  posType?: number;
  referencePointA?: number;
  referencePointB?: number;
  referencePointC?: number;
  referencePointD?: number;
  destination?: string;
  vesselLength?: number;
  vesselWidth?: number;
  aisPoint?: Point;
};

export type AisFeaturePathPredictorProperties = {
  featureType: 'aisvessel_pathpredictor';
  realSizeVessel: boolean;
  cog: number;
  vesselLength?: number;
  vesselWidth?: number;
};

type DirwayPoint = {
  orderNumber: number;
  coordinates: number[];
};

export type DirwayFeatureProperties = {
  featureType: 'dirway';
  id: string;
  name: string;
  description: string;
  updated: string;
  points: DirwayPoint[];
};

type Restriction = {
  id: string;
  description: string;
  startTime: string;
  endTime: string | undefined;
  updated: string;
};

export type RestrictionPortFeatureProperties = {
  featureType: 'restrictionport';
  id: string;
  name: string;
  updated: string;
  restrictions: Restriction[];
};

export type ForecastItem = {
  dateTime: number;
  visibility: number;
  windDirection: number;
  windSpeed: number;
  windGust: number;
  waveHeight: number;
  waveDirection: number;
};

export type ForecastFeatureProperties = {
  featureType: 'forecast';
  id: string;
  name: Text;
  pilotPlaceId?: number;
  forecastItems: ForecastItem[];
};

export function isShowN2000HeightSystem(props: AreaFeatureProperties | LineFeatureProperties): boolean {
  if (props.n2000HeightSystem !== undefined) {
    return props.n2000HeightSystem;
  } else if (props.isN2000 !== undefined) {
    return props.isN2000;
  } else {
    return (props.referenceLevel && props.referenceLevel.indexOf('N2000') !== -1) || !!props.n2000depth || !!props.n2000draft;
  }
}
