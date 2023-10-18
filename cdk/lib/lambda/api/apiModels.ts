import { Geometry } from 'geojson';

/* AIS */

export type Vessel = {
  name: string;
  timestamp: number;
  mmsi: number;
  callSign: string;
  imo: number;
  shipType: number;
  draught: number;
  eta: number;
  posType: number;
  referencePointA: number;
  referencePointB: number;
  referencePointC: number;
  referencePointD: number;
  destination: string;
};

type VesselLocationProperties = {
  mmsi: number;
  sog: number;
  cog: number;
  navStat: number;
  rot: number;
  posAcc: boolean;
  raim: boolean;
  heading?: number;
  timestamp: number;
  timestampExternal: number;
};

type VesselLocationFeature = {
  mmsi: number;
  type?: string;
  geometry: Geometry;
  properties: VesselLocationProperties;
};

export type VesselLocation = {
  type?: string;
  dataUpdatedTime?: string;
  features: VesselLocationFeature[];
};
