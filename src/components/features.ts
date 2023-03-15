import { Text } from '../graphql/generated';
import { EquipmentFault } from './FeatureLoader';

export type HarborFeatureProperties = {
  type: string;
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
  type: string;
  quay?: Text;
  extraInfo?: Text;
  length?: number;
  name?: string;
  depth?: number[];
  email?: string;
  phoneNumber?: string[];
  fax?: string;
  internet?: string;
};

export type Card = {
  id: string;
  name: Text;
};

export type PilotFeatureProperties = {
  name: string;
  fairwayCards: Card[];
};

export type AreaFeatureProperties = {
  id: number;
  typeCode: number;
  type: string;
  name?: string;
  referenceLevel: string;
  draft?: number;
  depth?: number;
  n2000ReferenceLevel: string;
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
  fairwayCards?: Card[];
};

export type LineFairway = {
  fairwayId: number;
  name: Text;
  fairwayCards?: Card[];
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
  direction?: number;
  extra?: string;
  fairways?: LineFairway[];
};

type EquipmentFairway = {
  fairwayId: number;
  primary: boolean;
  fairwayCards?: Card[];
};

export type EquipmentFeatureProperties = {
  id: number;
  featureType: string;
  subType?: string;
  navigation?: Text;
  navigationCode?: string;
  name?: Text;
  symbol?: string;
  typeCode?: string;
  typeName?: Text;
  lightning: boolean;
  aisType?: number;
  remoteControl?: number;
  fairways?: EquipmentFairway[];
  faults?: EquipmentFault[];
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
