import { useEffect, useState } from 'react';
import { FeatureDataId, FeatureDataLayerId, MAP } from '../utils/constants';
import { Feature } from 'ol';
import { GeoJSON } from 'ol/format';
import { Geometry } from 'ol/geom';
import { useFeatureData } from '../utils/dataLoader';
import dvkMap from './DvkMap';
import { DvkLayerState } from './FeatureLoader';

export function useObservationFeatures() {
  const [ready, setReady] = useState(false);
  const [observationFeatures, setObservationFeatures] = useState<Feature<Geometry>[]>([]);
  const { data, dataUpdatedAt, errorUpdatedAt, isPaused, isError, isPending, isFetching } = useFeatureData('observation');

  useEffect(() => {
    if (data) {
      const format = new GeoJSON();
      const oFeatures = format.readFeatures(data, {
        dataProjection: 'EPSG:4326',
        featureProjection: MAP.EPSG,
      });
      setObservationFeatures(oFeatures);
      setReady(true);
    }
  }, [data]);
  return { ready, observationFeatures, dataUpdatedAt, errorUpdatedAt, isPaused, isError, isPending, isFetching };
}

function useDataLayer(
  featureDataId: FeatureDataId,
  featureLayerId: FeatureDataLayerId,
  dataProjection = 'EPSG:4326',
  refetchOnMount: 'always' | boolean = true,
  refetchInterval: number | false = false,
  enabled: boolean = true
): DvkLayerState {
  const [ready, setReady] = useState(false);
  const { data, dataUpdatedAt, errorUpdatedAt, isPaused, isError } = useFeatureData(featureDataId, refetchOnMount, refetchInterval, enabled);
  useEffect(() => {
    if (data) {
      const layer = dvkMap.getFeatureLayer(featureLayerId);
      if (layer.get('dataUpdatedAt') !== dataUpdatedAt) {
        const format = new GeoJSON();
        const features = format.readFeatures(data, { dataProjection, featureProjection: MAP.EPSG });
        const source = dvkMap.getVectorSource(featureLayerId);
        source.clear();
        features.forEach((f) => f.set('dataSource', featureLayerId, true));
        source.addFeatures(features);
        layer.set('dataUpdatedAt', dataUpdatedAt);
      }
      setReady(true);
    }
  }, [featureLayerId, data, dataUpdatedAt, dataProjection]);
  const layer = dvkMap.getFeatureLayer(featureLayerId);
  layer.set('errorUpdatedAt', errorUpdatedAt);
  return { ready, dataUpdatedAt, errorUpdatedAt, isPaused, isError };
}

function featuresVisible(): boolean {
  const oLayer = dvkMap.getFeatureLayer('observation');
  const sfcLayer = dvkMap.getFeatureLayer('selectedfairwaycard');
  return oLayer.isVisible() || sfcLayer.isVisible();
}

export function useObservationLayer() {
  const [initialized, setInitialized] = useState(false);
  const [fetchingEnabled, setFetchingEnabled] = useState(featuresVisible());
  if (!initialized) {
    const oLayer = dvkMap.getFeatureLayer('observation');
    const sfcLayer = dvkMap.getFeatureLayer('selectedfairwaycard');
    oLayer.on('change:visible', () => {
      setFetchingEnabled(featuresVisible());
    });
    sfcLayer.on('change:visible', () => {
      setFetchingEnabled(featuresVisible());
    });
    setInitialized(true);
  }
  return useDataLayer('observation', 'observation', 'EPSG:4258', 'always', 1000 * 60 * 10, fetchingEnabled);
}
