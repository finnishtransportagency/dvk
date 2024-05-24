import { useEffect, useState } from 'react';
import { MAP } from '../utils/constants';
import { Feature } from 'ol';
import { GeoJSON } from 'ol/format';
import { Geometry } from 'ol/geom';
import { useFeatureData } from '../utils/dataLoader';

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
