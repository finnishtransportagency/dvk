import { Text } from '../graphql/generated';

export type HarborFeatureProperties = {
  type: string;
  name?: Text;
  email?: string;
  phoneNumber?: string[];
  fax?: string;
  internet?: string;
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

type Card = {
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

type AreaFairway = {
  id: number;
  name: Text;
  sizingSpeed?: number;
  sizingSpeed2?: number;
  fairwayCards?: Card[];
};
