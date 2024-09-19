import { useEffect, useState } from 'react';
import { MAP } from '../utils/constants';
import { Feature } from 'ol';
import { GeoJSON } from 'ol/format';
import { Geometry } from 'ol/geom';
import dvkMap from './DvkMap';
import { useFairwayCardListData, useFeatureData } from '../utils/dataLoader';
import { FairwayCardPartsFragment } from '../graphql/generated';
import { Card } from './features';

function addFairwayCardData(features: Feature<Geometry>[], cards: FairwayCardPartsFragment[]) {
  features.forEach((f) => {
    const fairwayCards: Card[] = cards
      ?.filter((card) => card.pilotRoutes?.some((pr) => pr.id === f.getId()))
      ?.map((c) => {
        return { id: c.id, name: c.name };
      });
    f.set('fairwayCards', fairwayCards ?? [], true);
  });
}

export function usePilotRouteFeatures() {
  const [ready, setReady] = useState(false);
  const [pilotRouteFeatures, setPilotRouteFeatures] = useState<Feature<Geometry>[]>([]);
  const { data, dataUpdatedAt, errorUpdatedAt, isPaused, isError, isPending, isFetching } = useFeatureData('pilotroute');
  const { data: fairwayCardData } = useFairwayCardListData();

  useEffect(() => {
    if (data && fairwayCardData) {
      const format = new GeoJSON();
      const pilotRouteFeatures = format.readFeatures(data, {
        dataProjection: 'EPSG:4326',
        featureProjection: MAP.EPSG,
      });
      addFairwayCardData(pilotRouteFeatures, fairwayCardData.fairwayCards);
      setPilotRouteFeatures(pilotRouteFeatures);
      setReady(true);
    }
  }, [data, fairwayCardData]);
  return { ready, pilotRouteFeatures, dataUpdatedAt, errorUpdatedAt, isPaused, isError, isPending, isFetching };
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
