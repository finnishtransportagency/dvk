import { DvkLayerState } from './FeatureLoader';
import { useEffect, useState } from 'react';
import { useFeatureData } from '../utils/dataLoader';
import dvkMap from './DvkMap';
import { GeoJSON } from 'ol/format';
import { MAP } from '../utils/constants';
import { Feature } from 'ol';
import { Geometry } from 'ol/geom';
import { getFeatureDataSourceProjection } from '../utils/common';

export function useQuayFeatures() {
  const [ready, setReady] = useState(false);
  const [quayFeatures, setQuayFeatures] = useState<Feature<Geometry>[]>([]);
  const { data, dataUpdatedAt, errorUpdatedAt, isPaused, isError, isPending, isFetching } = useFeatureData('quay');

  useEffect(() => {
    if (data) {
      const format = new GeoJSON();
      const quayFeatures = format.readFeatures(data, { dataProjection: getFeatureDataSourceProjection('quay'), featureProjection: MAP.EPSG });
      setQuayFeatures(quayFeatures);
      setReady(true);
    }
  }, [data]);
  return { ready, quayFeatures, dataUpdatedAt, errorUpdatedAt, isPaused, isError, isPending, isFetching };
}

export function useQuayLayer(): DvkLayerState {
  const layerId = 'quay';
  const { ready, quayFeatures, dataUpdatedAt, errorUpdatedAt, isPaused, isError } = useQuayFeatures();
  useEffect(() => {
    const layer = dvkMap.getFeatureLayer(layerId);
    if (ready && layer.get('dataUpdatedAt') !== dataUpdatedAt) {
      const source = dvkMap.getVectorSource(layerId);
      source.clear();
      quayFeatures.forEach((f) => {
        f.set('dataSource', layerId, true);
        f.set('featureType', f.getProperties().featureType, true);
      });
      source.addFeatures(quayFeatures);
      layer.set('dataUpdatedAt', dataUpdatedAt);
    }
    layer.set('errorUpdatedAt', errorUpdatedAt, true);
  }, [ready, quayFeatures, dataUpdatedAt, errorUpdatedAt, layerId]);

  return { ready, dataUpdatedAt, errorUpdatedAt, isPaused, isError };
}
