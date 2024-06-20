import { useEffect, useState } from 'react';
import { MAP } from '../utils/constants';
import { Feature } from 'ol';
import { GeoJSON } from 'ol/format';
import { Geometry } from 'ol/geom';
import { useFeatureData } from '../utils/dataLoader';

export function useMareographFeatures() {
  const [ready, setReady] = useState(false);
  const [mareographFeatures, setMareographFeatures] = useState<Feature<Geometry>[]>([]);
  const { data, dataUpdatedAt, errorUpdatedAt, isPaused, isError, isPending, isFetching } = useFeatureData('mareograph');

  useEffect(() => {
    if (data) {
      const format = new GeoJSON();
      const oFeatures = format.readFeatures(data, {
        dataProjection: 'EPSG:4258',
        featureProjection: MAP.EPSG,
      });
      setMareographFeatures(oFeatures);
      setReady(true);
    }
  }, [data]);
  return { ready, mareographFeatures, dataUpdatedAt, errorUpdatedAt, isPaused, isError, isPending, isFetching };
}
