import { useEffect, useState } from 'react';
import { Feature } from 'ol';
import { Geometry, LineString } from 'ol/geom';
import dvkMap from './DvkMap';
import { LineString as geojson_LineString } from 'geojson';
import { useFeatureData } from '../../utils/dataLoader';
import { MAP } from '../../utils/constants';

type RtzData = {
  tunnus: number;
  tila: number;
  nimi: string;
  tunniste: string;
  rtz: string;
  geometria: geojson_LineString;
};

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
      const rtzData = pilotRouteData as unknown as RtzData[];
      const features: Feature<Geometry>[] = [];
      rtzData.forEach((rtz) => {
        const routeLine = new LineString(rtz.geometria.coordinates);
        routeLine.transform('EPSG:4326', MAP.EPSG);
        features.push(new Feature(routeLine));
      });
      setPilotRouteFeatures(features);
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
