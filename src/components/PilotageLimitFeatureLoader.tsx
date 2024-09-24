import { useEffect, useState } from 'react';
import { MAP } from '../utils/constants';
import { Feature } from 'ol';
import { GeoJSON } from 'ol/format';
import { Geometry } from 'ol/geom';
import dvkMap from './DvkMap';
import { useFeatureData } from '../utils/dataLoader';
import { PilotageLimitFeatureProperties } from './features';
import { getFeatureDataSourceProjection } from '../utils/common';

export function usePilotageLimitFeatures() {
  const [ready, setReady] = useState(false);
  const [pilotageLimitFeatures, setPilotageLimitFeatures] = useState<Feature<Geometry>[]>([]);
  const { data, dataUpdatedAt, errorUpdatedAt, isPaused, isError, isPending, isFetching } = useFeatureData('pilotagelimit');

  useEffect(() => {
    if (data) {
      const format = new GeoJSON();
      const plFeatures = format.readFeatures(data, {
        dataProjection: getFeatureDataSourceProjection('pilotagelimit'),
        featureProjection: MAP.EPSG,
      });
      setPilotageLimitFeatures(plFeatures);
      setReady(true);
    }
  }, [data]);
  return { ready, pilotageLimitFeatures, dataUpdatedAt, errorUpdatedAt, isPaused, isError, isPending, isFetching };
}

export function usePilotageLimitLayer() {
  const layerId = 'pilotagelimit';
  const { ready, pilotageLimitFeatures, dataUpdatedAt, errorUpdatedAt, isPaused, isError } = usePilotageLimitFeatures();

  useEffect(() => {
    const layer = dvkMap.getFeatureLayer(layerId);
    if (ready && layer.get('dataUpdatedAt') !== dataUpdatedAt) {
      const source = dvkMap.getVectorSource(layerId);
      source.clear();
      pilotageLimitFeatures.forEach((f) => {
        f.setId((f.getProperties() as PilotageLimitFeatureProperties).fid);
        f.set('dataSource', layerId, true);
        f.set('featureType', layerId, true);
      });
      source.addFeatures(pilotageLimitFeatures);
      layer.set('dataUpdatedAt', dataUpdatedAt);
    }
    layer.set('errorUpdatedAt', errorUpdatedAt, true);
  }, [ready, pilotageLimitFeatures, dataUpdatedAt, errorUpdatedAt, layerId]);

  return { ready, dataUpdatedAt, errorUpdatedAt, isPaused, isError };
}
