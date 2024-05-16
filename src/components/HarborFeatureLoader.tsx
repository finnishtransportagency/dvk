import { DvkLayerState } from './FeatureLoader';
import { useEffect, useState } from 'react';
import { useFeatureData } from '../utils/dataLoader';
import dvkMap from './DvkMap';
import { GeoJSON } from 'ol/format';
import { MAP } from '../utils/constants';

export function useHarborLayer(): DvkLayerState {
  const [ready, setReady] = useState(false);
  const { data, dataUpdatedAt, errorUpdatedAt, isPaused, isError } = useFeatureData('harbor', true, false, true);
  useEffect(() => {
    if (data) {
      const layer = dvkMap.getFeatureLayer('harbor');
      if (layer.get('dataUpdatedAt') !== dataUpdatedAt) {
        const format = new GeoJSON();
        const features = format.readFeatures(data, { dataProjection: 'EPSG:4326', featureProjection: MAP.EPSG });
        const source = dvkMap.getVectorSource('harbor');
        source.clear();
        features.forEach((f) => f.set('dataSource', 'harbor', true));
        source.addFeatures(features);
        layer.set('dataUpdatedAt', dataUpdatedAt);
      }
      setReady(true);
    }
  }, [data, dataUpdatedAt]);
  const layer = dvkMap.getFeatureLayer('harbor');
  layer.set('errorUpdatedAt', errorUpdatedAt);
  return { ready, dataUpdatedAt, errorUpdatedAt, isPaused, isError };
}
