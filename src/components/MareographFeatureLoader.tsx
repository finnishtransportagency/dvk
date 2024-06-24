import { useEffect, useState } from 'react';
import { Feature } from 'ol';
import { GeoJSON } from 'ol/format';
import { Geometry } from 'ol/geom';
import { useFeatureData } from '../utils/dataLoader';
import { FeatureDataId, FeatureDataLayerId, MAP } from '../utils/constants';
import dvkMap from './DvkMap';
import { DvkLayerState } from './FeatureLoader';

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

        features.forEach((f) => {
          const id = f.getId();
          const sourceFeat = id ? source.getFeatureById(id) : null;
          if (sourceFeat) {
            sourceFeat.setProperties(f.getProperties());
          } else {
            f.set('dataSource', featureLayerId, true);
            source.addFeature(f);
          }
        });
        const featureIds = features.map((f) => f.getId());
        const featuresToRemove = source.getFeatures().filter((f) => !featureIds.includes(f.getId()));
        source.removeFeatures(featuresToRemove);

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
  const oLayer = dvkMap.getFeatureLayer('mareograph');
  const sfcLayer = dvkMap.getFeatureLayer('selectedfairwaycard');
  return oLayer.isVisible() || sfcLayer.isVisible();
}

export function useMareographLayer() {
  const [initialized, setInitialized] = useState(false);
  const [fetchingEnabled, setFetchingEnabled] = useState(featuresVisible());
  if (!initialized) {
    const layer = dvkMap.getFeatureLayer('mareograph');
    const sfcLayer = dvkMap.getFeatureLayer('selectedfairwaycard');
    layer.on('change:visible', () => {
      setFetchingEnabled(featuresVisible());
    });
    sfcLayer.on('change:visible', () => {
      setFetchingEnabled(featuresVisible());
    });
    setInitialized(true);
  }
  return useDataLayer('mareograph', 'mareograph', 'EPSG:4258', 'always', 1000 * 60 * 5, fetchingEnabled);
}

export function useMareographFeatures() {
  const [ready, setReady] = useState(false);
  const [mareographFeatures, setMareographFeatures] = useState<Feature<Geometry>[]>([]);
  const { data, dataUpdatedAt, errorUpdatedAt, isPaused, isError, isPending, isFetching } = useFeatureData('mareograph');

  useEffect(() => {
    if (data) {
      const format = new GeoJSON();
      const oFeatures = format.readFeatures(data);
      setMareographFeatures(oFeatures);
      setReady(true);
    }
  }, [data]);
  return { ready, mareographFeatures, dataUpdatedAt, errorUpdatedAt, isPaused, isError, isPending, isFetching };
}
