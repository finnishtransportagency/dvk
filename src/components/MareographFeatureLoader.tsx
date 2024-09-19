import { useEffect, useState } from 'react';
import { Feature } from 'ol';
import { GeoJSON } from 'ol/format';
import { Geometry } from 'ol/geom';
import { useFeatureData } from '../utils/dataLoader';
import dvkMap from './DvkMap';
import { featuresVisible, useConditionsDataLayer } from './FeatureLoader';

export function useMareographLayer() {
  const [initialized, setInitialized] = useState(false);
  const [fetchingEnabled, setFetchingEnabled] = useState(featuresVisible('mareograph'));
  const { refetch } = useFeatureData('mareograph');
  if (!initialized) {
    const layer = dvkMap.getFeatureLayer('mareograph');
    const sfcLayer = dvkMap.getFeatureLayer('selectedfairwaycard');
    layer.on('change:visible', () => {
      setFetchingEnabled(featuresVisible('mareograph'));
      if (featuresVisible('mareograph')) {
        refetch();
      }
    });
    sfcLayer.on('change:visible', () => {
      setFetchingEnabled(featuresVisible('mareograph'));
      if (featuresVisible('mareograph')) {
        refetch();
      }
    });
    setInitialized(true);
  }
  return useConditionsDataLayer('mareograph', 'mareograph', 'EPSG:4258', fetchingEnabled);
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
