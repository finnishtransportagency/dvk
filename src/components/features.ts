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

export type LineFairway = {
  fairwayId: number;
  name: Text;
};

export type LineFeatureProperties = {
  id: number;
  featureType: string;
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
  id: number;
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
