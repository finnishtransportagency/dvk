import { useEffect, useState } from 'react';
import { Feature } from 'ol';
import { Geometry } from 'ol/geom';
import { GeoJSON } from 'ol/format';
import dvkMap from './DvkMap';
import { useFeatureData } from '../../utils/dataLoader';
import { MAP } from '../../utils/constants';

function usePilotRouteFeatures() {
  const [ready, setReady] = useState(false);
  const [pilotRouteFeatures, setPilotRouteFeatures] = useState<Feature<Geometry>[]>([]);
  const pilotRouteQuery = useFeatureData('pilotroute', true, 60 * 60 * 1000, 2 * 60 * 60 * 1000, 2 * 60 * 60 * 1000);
  const dataUpdatedAt = pilotRouteQuery.dataUpdatedAt;
  const errorUpdatedAt = pilotRouteQuery.errorUpdatedAt;
  const isPaused = pilotRouteQuery.isPaused;
  const isError = pilotRouteQuery.isError;

  useEffect(() => {
    const pilotRouteData = pilotRouteQuery.data;
    if (pilotRouteData) {
      const format = new GeoJSON();
      const pilotRouteFeatures = format.readFeatures(pilotRouteData, {
        dataProjection: 'EPSG:4326',
        featureProjection: MAP.EPSG,
      });
      setPilotRouteFeatures(pilotRouteFeatures);
      setReady(true);
    }
  }, [pilotRouteQuery.data]);
  return { ready, pilotRouteFeatures, dataUpdatedAt, errorUpdatedAt, isPaused, isError };
}

export function usePilotRouteLayer() {
  const layerId = 'pilotroute';
  const { ready, pilotRouteFeatures, dataUpdatedAt, errorUpdatedAt, isPaused, isError } = usePilotRouteFeatures();

  useEffect(() => {
    const layer = dvkMap.getFeatureLayer(layerId);
    if (ready && layer.get('dataUpdatedAt') !== dataUpdatedAt) {
      const source = dvkMap.getVectorSource(layerId);
      source.clear();
      pilotRouteFeatures.forEach((f) => f.set('dataSource', layerId, true));
      source.addFeatures(pilotRouteFeatures);
      layer.set('dataUpdatedAt', dataUpdatedAt);
    }
    layer.set('errorUpdatedAt', errorUpdatedAt, true);
  }, [ready, pilotRouteFeatures, dataUpdatedAt, errorUpdatedAt, layerId]);

  return { ready, dataUpdatedAt, errorUpdatedAt, isPaused, isError };
}
