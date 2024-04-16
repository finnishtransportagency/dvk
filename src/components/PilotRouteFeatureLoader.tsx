import { useEffect, useState } from 'react';
import { MAP, OFFLINE_STORAGE } from '../utils/constants';
import { Feature } from 'ol';
import { GeoJSON } from 'ol/format';
import { Geometry } from 'ol/geom';
import dvkMap from './DvkMap';
import { useFeatureData } from '../utils/dataLoader';
import { useDvkContext } from '../hooks/dvkContext';

function usePilotRouteFeatures() {
  const { state } = useDvkContext();
  const [ready, setReady] = useState(false);
  const [enabled, setEnabled] = useState(state.layers.includes('pilotroute'));
  const [pilotRouteFeatures, setPilotRouteFeatures] = useState<Feature<Geometry>[]>([]);
  const pilotRouteQuery = useFeatureData('pilotroute', true, 60 * 60 * 1000, enabled, OFFLINE_STORAGE.staleTime, OFFLINE_STORAGE.cacheTime);
  const dataUpdatedAt = pilotRouteQuery.dataUpdatedAt;
  const errorUpdatedAt = pilotRouteQuery.errorUpdatedAt;
  const isPaused = pilotRouteQuery.isPaused;
  const isError = pilotRouteQuery.isError;

  useEffect(() => {
    setEnabled(state.layers.includes('pilotroute'));
  }, [state.layers]);

  useEffect(() => {
    const pilotRouteData = pilotRouteQuery.data;
    if (pilotRouteData) {
      const format = new GeoJSON();
      const pilotRouteFeatures = format.readFeatures(pilotRouteData, {
        dataProjection: 'EPSG:4326',
        featureProjection: MAP.EPSG,
      }) as Feature<Geometry>[];
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
    const source = dvkMap.getVectorSource(layerId);
    source.clear();
    pilotRouteFeatures.forEach((f) => f.set('dataSource', layerId, true));
    source.addFeatures(pilotRouteFeatures);
    layer.set('dataUpdatedAt', dataUpdatedAt);
  }, [ready, pilotRouteFeatures, dataUpdatedAt, errorUpdatedAt, layerId]);

  return { ready, dataUpdatedAt, errorUpdatedAt, isPaused, isError };
}
