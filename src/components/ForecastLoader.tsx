import { useEffect, useState } from 'react';
import { Feature } from 'ol';
import { GeoJSON } from 'ol/format';
import { Geometry } from 'ol/geom';
import { useFeatureData } from '../utils/dataLoader';

export function useForecastFeatures() {
  const [ready, setReady] = useState(false);
  const [forecastFeatures, setForecastFeatures] = useState<Feature<Geometry>[]>([]);
  const { data, dataUpdatedAt, errorUpdatedAt, isPaused, isError, isPending, isFetching } = useFeatureData('forecast');

  useEffect(() => {
    if (data) {
      const format = new GeoJSON();
      const oFeatures = format.readFeatures(data);
      setForecastFeatures(oFeatures);
      setReady(true);
    }
  }, [data]);
  return { ready, forecastFeatures, dataUpdatedAt, errorUpdatedAt, isPaused, isError, isPending, isFetching };
}
