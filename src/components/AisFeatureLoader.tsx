import { Feature } from 'ol';
import { GeoJSON } from 'ol/format';
import { Geometry } from 'ol/geom';
import { FeatureDataLayerId, MAP } from '../utils/constants';
import dvkMap from './DvkMap';
import { useFeatureData } from '../utils/dataLoader';
import { useEffect, useState } from 'react';
import { DvkLayerState } from './FeatureLoader';

type VesselData = {
  name: string;
  timestamp: number;
  mmsi: string;
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

const cargoShipTypes = [70, 71, 72, 73, 74, 75, 76, 77, 78, 79];
const tankerShipTypes = [80, 81, 82, 83, 84, 85, 86, 87, 88, 89];
const passengerShipTypes = [60, 61, 62, 63, 64, 65, 66, 67, 68, 69];
const highSpeedShipTypes = [40, 41, 42, 43, 44, 45, 46, 47, 48, 49];
const tugAndSpecialCraftShipTypes = [31, 32, 33, 34, 35, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59];
const fishingShipTypes = [30];
const pleasureCraftShipTypes = [36, 37];
const navigationAidEquipmentShipTypes = [100];

function addVesselData(locationFeatures: Feature<Geometry>[], vesselData: Array<VesselData>) {
  for (const l of locationFeatures) {
    const vessel = vesselData.find((v) => v.mmsi === l.get('mmsi'));
    if (vessel) {
      l.setProperties({
        name: vessel.name,
        callSign: vessel.callSign,
        imo: vessel.imo,
        shipType: vessel.shipType,
        draught: vessel.draught,
        eta: vessel.eta,
        posType: vessel.posType,
        referencePointA: vessel.referencePointA,
        referencePointB: vessel.referencePointB,
        referencePointC: vessel.referencePointC,
        referencePointD: vessel.referencePointD,
        destination: vessel.destination,
      });
    }
  }
}

function useAisFeatures() {
  const [ready, setReady] = useState(false);
  const [aisFeatures, setAisFeatures] = useState<Feature<Geometry>[]>([]);
  const vesselQuery = useFeatureData('aisvessel');
  const locationQuery = useFeatureData('aislocation');
  const dataUpdatedAt = Math.max(vesselQuery.dataUpdatedAt, locationQuery.dataUpdatedAt);
  const errorUpdatedAt = Math.max(vesselQuery.errorUpdatedAt, locationQuery.errorUpdatedAt);
  const isPaused = vesselQuery.isPaused || locationQuery.isPaused;
  const isError = vesselQuery.isError || locationQuery.isError;

  useEffect(() => {
    const vesselData = vesselQuery.data;
    const locationData = locationQuery.data;
    if (vesselData && locationData) {
      const format = new GeoJSON();
      const locationFeatures = format.readFeatures(locationData, { dataProjection: 'EPSG:4326', featureProjection: MAP.EPSG });
      addVesselData(locationFeatures, vesselData);
      setAisFeatures(locationFeatures);
      setReady(true);
    }
  }, [vesselQuery.data, locationQuery.data, dataUpdatedAt]);
  return { ready, aisFeatures, dataUpdatedAt, errorUpdatedAt, isPaused, isError };
}

function setLayerFeatures(featureLayerId: FeatureDataLayerId, features: Feature<Geometry>[], dataUpdatedAt: number) {
  const layer = dvkMap.getFeatureLayer(featureLayerId);
  const source = dvkMap.getVectorSource(featureLayerId);
  source.clear();
  features.forEach((f) => f.set('dataSource', featureLayerId, true));
  source.addFeatures(features);
  layer.set('dataUpdatedAt', dataUpdatedAt);
}

export function useAisVesselCargoLayer(): DvkLayerState {
  const { ready, aisFeatures, dataUpdatedAt, errorUpdatedAt, isPaused, isError } = useAisFeatures();
  const layerFeatures = aisFeatures.filter((f) => {
    return cargoShipTypes.includes(f.get('shipType'));
  });
  setLayerFeatures('aisvesselcargo', layerFeatures, dataUpdatedAt);
  return { ready, dataUpdatedAt, errorUpdatedAt, isPaused, isError };
}

export function useAisVesselTankerLayer() {
  const { ready, aisFeatures, dataUpdatedAt, errorUpdatedAt, isPaused, isError } = useAisFeatures();
  const layerFeatures = aisFeatures.filter((f) => {
    return tankerShipTypes.includes(f.get('shipType'));
  });
  setLayerFeatures('aisvesseltanker', layerFeatures, dataUpdatedAt);
  return { ready, dataUpdatedAt, errorUpdatedAt, isPaused, isError };
}

export function useAisVesselPassengerLayer() {
  const { ready, aisFeatures, dataUpdatedAt, errorUpdatedAt, isPaused, isError } = useAisFeatures();
  const layerFeatures = aisFeatures.filter((f) => {
    return passengerShipTypes.includes(f.get('shipType'));
  });
  setLayerFeatures('aisvesselpassenger', layerFeatures, dataUpdatedAt);
  return { ready, dataUpdatedAt, errorUpdatedAt, isPaused, isError };
}

export function useAisVesselHighSpeedLayer() {
  const { ready, aisFeatures, dataUpdatedAt, errorUpdatedAt, isPaused, isError } = useAisFeatures();
  const layerFeatures = aisFeatures.filter((f) => {
    return highSpeedShipTypes.includes(f.get('shipType'));
  });
  setLayerFeatures('aisvesselhighspeed', layerFeatures, dataUpdatedAt);
  return { ready, dataUpdatedAt, errorUpdatedAt, isPaused, isError };
}

export function useAisVesselTugAndSpecialCraftLayer() {
  const { ready, aisFeatures, dataUpdatedAt, errorUpdatedAt, isPaused, isError } = useAisFeatures();
  const layerFeatures = aisFeatures.filter((f) => {
    return tugAndSpecialCraftShipTypes.includes(f.get('shipType'));
  });
  setLayerFeatures('aisvesseltugandspecialcraft', layerFeatures, dataUpdatedAt);
  return { ready, dataUpdatedAt, errorUpdatedAt, isPaused, isError };
}

export function useAisVesselFishingLayer() {
  const { ready, aisFeatures, dataUpdatedAt, errorUpdatedAt, isPaused, isError } = useAisFeatures();
  const layerFeatures = aisFeatures.filter((f) => {
    return fishingShipTypes.includes(f.get('shipType'));
  });
  setLayerFeatures('aisvesselfishing', layerFeatures, dataUpdatedAt);
  return { ready, dataUpdatedAt, errorUpdatedAt, isPaused, isError };
}

export function useAisVesselPleasureCraftLayer() {
  const { ready, aisFeatures, dataUpdatedAt, errorUpdatedAt, isPaused, isError } = useAisFeatures();
  const layerFeatures = aisFeatures.filter((f) => {
    return pleasureCraftShipTypes.includes(f.get('shipType'));
  });
  setLayerFeatures('aisvesselpleasurecraft', layerFeatures, dataUpdatedAt);
  return { ready, dataUpdatedAt, errorUpdatedAt, isPaused, isError };
}

export function useAisNavigationAidEquipmentLayer() {
  const { ready, aisFeatures, dataUpdatedAt, errorUpdatedAt, isPaused, isError } = useAisFeatures();
  const layerFeatures = aisFeatures.filter((f) => {
    return navigationAidEquipmentShipTypes.includes(f.get('shipType'));
  });
  setLayerFeatures('aisnavigationaidequipment', layerFeatures, dataUpdatedAt);
  return { ready, dataUpdatedAt, errorUpdatedAt, isPaused, isError };
}

export function useAisUnspecifiedLayer() {
  const { ready, aisFeatures, dataUpdatedAt, errorUpdatedAt, isPaused, isError } = useAisFeatures();
  const layerFeatures = aisFeatures.filter((f) => {
    return ![
      ...cargoShipTypes,
      ...tankerShipTypes,
      ...passengerShipTypes,
      ...highSpeedShipTypes,
      ...tugAndSpecialCraftShipTypes,
      ...fishingShipTypes,
      ...pleasureCraftShipTypes,
      ...navigationAidEquipmentShipTypes,
    ].includes(f.get('shipType'));
  });
  setLayerFeatures('aisunspecified', layerFeatures, dataUpdatedAt);
  return { ready, dataUpdatedAt, errorUpdatedAt, isPaused, isError };
}
