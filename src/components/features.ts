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
  draft?: number[];
  email?: string;
  phoneNumber?: string[];
  fax?: string;
  internet?: string;
};
