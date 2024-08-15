import { useEffect, useState } from 'react';
import { MAP } from '../utils/constants';
import { Feature } from 'ol';
import { GeoJSON } from 'ol/format';
import { Geometry } from 'ol/geom';
import { useFeatureData } from '../utils/dataLoader';
import dvkMap from './DvkMap';
import { featuresVisible, useConditionsDataLayer } from './FeatureLoader';

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

export function useObservationLayer() {
  const [initialized, setInitialized] = useState(false);
  const [fetchingEnabled, setFetchingEnabled] = useState(featuresVisible('observation'));
  if (!initialized) {
    const oLayer = dvkMap.getFeatureLayer('observation');
    const sfcLayer = dvkMap.getFeatureLayer('selectedfairwaycard');
    oLayer.on('change:visible', () => {
      setFetchingEnabled(featuresVisible('observation'));
    });
    sfcLayer.on('change:visible', () => {
      setFetchingEnabled(featuresVisible('observation'));
    });
    setInitialized(true);
  }
  return useConditionsDataLayer('observation', 'observation', 'EPSG:4258', 'always', 1000 * 60 * 10, fetchingEnabled);
}
