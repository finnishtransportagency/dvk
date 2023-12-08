import { Feature } from 'ol';
import { GeoJSON } from 'ol/format';
import { Geometry } from 'ol/geom';
import { FeatureDataLayerId, MAP } from '../utils/constants';
import dvkMap from './DvkMap';
import { useFeatureData } from '../utils/dataLoader';
import { useEffect, useState } from 'react';
import { DvkLayerState } from './FeatureLoader';
import { useDvkContext } from '../hooks/dvkContext';
import _ from 'lodash';
import { calculateVesselDimensions } from '../utils/aisUtils';
import VectorSource from 'ol/source/Vector';

type VesselData = {
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

type AisLayer = {
  id: FeatureDataLayerId;
  shipTypes: Array<number>;
};

const aisLayers: Array<AisLayer> = [
  { id: 'aisvesselcargo', shipTypes: _.range(70, 79) },
  { id: 'aisvesseltanker', shipTypes: _.range(80, 89) },
  { id: 'aisvesselpassenger', shipTypes: _.range(60, 69) },
  { id: 'aisvesselhighspeed', shipTypes: _.range(40, 49) },
  { id: 'aisvesseltugandspecialcraft', shipTypes: [31, 32, 33, 34, 35, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59] },
  { id: 'aisvesselpleasurecraft', shipTypes: [36, 37] },
  { id: 'aisunspecified', shipTypes: _.range(90, 99) },
];

function addVesselData(locationFeatures: Feature<Geometry>[], vesselData: Array<VesselData>) {
  for (const l of locationFeatures) {
    const vessel = vesselData.find((v) => v.mmsi === l.get('mmsi'));
    if (vessel) {
      const vesselDimensions = calculateVesselDimensions(
        vessel.referencePointA,
        vessel.referencePointB,
        vessel.referencePointC,
        vessel.referencePointD
      );
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
        vesselLength: vesselDimensions[0],
        vesselWidth: vesselDimensions[1],
        showPathPredictor: false,
      });
    }
  }
}

function useAisFeatures() {
  const { state } = useDvkContext();
  const [ready, setReady] = useState(false);
  const [enabled, setEnabled] = useState(aisLayers.some((layer) => state.layers.includes(layer.id)));
  const [aisFeatures, setAisFeatures] = useState<Feature<Geometry>[]>([]);
  const vesselQuery = useFeatureData('aisvessel', true, 60 * 60 * 1000, enabled, 2 * 60 * 60 * 1000, 2 * 60 * 60 * 1000);
  const locationQuery = useFeatureData('aislocation', true, 60 * 1000, enabled, 5 * 60 * 1000, 5 * 60 * 1000);
  const dataUpdatedAt = Math.max(vesselQuery.dataUpdatedAt, locationQuery.dataUpdatedAt);
  const errorUpdatedAt = Math.max(vesselQuery.errorUpdatedAt, locationQuery.errorUpdatedAt);
  const isPaused = vesselQuery.isPaused || locationQuery.isPaused;
  const isError = vesselQuery.isError || locationQuery.isError;

  useEffect(() => {
    setEnabled(aisLayers.some((layer) => state.layers.includes(layer.id)));
  }, [state.layers]);

  useEffect(() => {
    const vesselData = vesselQuery.data;
    const locationData = locationQuery.data;
    if (vesselData && locationData) {
      const format = new GeoJSON();
      const locationFeatures = format.readFeatures(locationData, { dataProjection: 'EPSG:4326', featureProjection: MAP.EPSG }) as Feature<Geometry>[];
      addVesselData(locationFeatures, vesselData);
      setAisFeatures(locationFeatures);
      setReady(true);
    }
  }, [vesselQuery.data, locationQuery.data, dataUpdatedAt]);
  return { ready, aisFeatures, dataUpdatedAt, errorUpdatedAt, isPaused, isError };
}

function updateAisLayerFeatures(id: FeatureDataLayerId, aisFeatures: Feature<Geometry>[]) {
  const aisLayer = aisLayers.find((al) => al.id === id);
  const source = dvkMap.getVectorSource(id);
  if (aisLayer && source) {
    source.clear();
    const features = aisFeatures.filter((f) => aisLayer.shipTypes.includes(f.get('shipType')));
    features.forEach((f) => f.set('dataSource', id, true));
    source.addFeatures(features);
  }
}

function useAisLayer(layerId: FeatureDataLayerId) {
  const { state } = useDvkContext();
  const { ready, aisFeatures, dataUpdatedAt, errorUpdatedAt, isPaused, isError } = useAisFeatures();

  useEffect(() => {
    const layer = dvkMap.getFeatureLayer(layerId);
    if (ready && state.layers.includes(layerId) && layer.get('dataUpdatedAt') !== dataUpdatedAt) {
      updateAisLayerFeatures(layerId, aisFeatures);
      layer.set('dataUpdatedAt', dataUpdatedAt);
    }
    layer.set('errorUpdatedAt', errorUpdatedAt);
  }, [ready, aisFeatures, dataUpdatedAt, errorUpdatedAt, state.layers, layerId]);

  useEffect(() => {
    if (ready) {
      const layer = dvkMap.getFeatureLayer(layerId);
      const source = layer.getSource() as VectorSource;
      source.forEachFeature((f) => f.set('showPathPredictor', state.showAisPredictor, true));
      layer.changed();
    }
  }, [ready, state.showAisPredictor, layerId, dataUpdatedAt]);

  return { ready, dataUpdatedAt, errorUpdatedAt, isPaused, isError };
}

export function useAisVesselCargoLayer(): DvkLayerState {
  return useAisLayer('aisvesselcargo');
}

export function useAisVesselTankerLayer() {
  return useAisLayer('aisvesseltanker');
}

export function useAisVesselPassengerLayer() {
  return useAisLayer('aisvesselpassenger');
}

export function useAisVesselHighSpeedLayer() {
  return useAisLayer('aisvesselhighspeed');
}

export function useAisVesselTugAndSpecialCraftLayer() {
  return useAisLayer('aisvesseltugandspecialcraft');
}

export function useAisVesselPleasureCraftLayer() {
  return useAisLayer('aisvesselpleasurecraft');
}

export function useAisUnspecifiedLayer() {
  return useAisLayer('aisunspecified');
}
