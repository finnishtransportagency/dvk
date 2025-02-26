import { Text } from '../../graphql/generated';

type Card = {
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

type AreaFairway = {
  fairwayId: number;
  name: Text;
  sizingSpeed?: number;
  sizingSpeed2?: number;
};

type LineFairway = {
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

type EquipmentFairway = {
  fairwayId: number;
  primary: boolean;
};

type EquipmentFault = {
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
};

export type VtsFeatureProperties = {
  featureType: 'vtspoint' | 'vtsline';
  identifier: string;
  name?: string;
  information?: string;
  channel?: string;
};
