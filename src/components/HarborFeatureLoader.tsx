import { DvkLayerState } from './FeatureLoader';
import { useEffect, useState } from 'react';
import { useFairwayCardListData, useFeatureData } from '../utils/dataLoader';
import dvkMap from './DvkMap';
import { GeoJSON } from 'ol/format';
import { MAP } from '../utils/constants';
import { Feature } from 'ol';
import { Geometry } from 'ol/geom';
import { FairwayCardPartsFragment } from '../graphql/generated';
import { Card } from './features';

function addFairwayCardData(features: Feature<Geometry>[], cards: FairwayCardPartsFragment[]) {
  features.forEach((f) => {
    const fairwayCards: Card[] = cards
      ?.filter((card) => card.harbors?.some((pr) => pr.id === f.getProperties().harborId))
      ?.map((c) => {
        return { id: c.id, name: c.name };
      });
    f.set('fairwayCards', fairwayCards ?? [], true);
  });
}

export function useHarborFeatures() {
  const [ready, setReady] = useState(false);
  const [harborFeatures, setHarborFeatures] = useState<Feature<Geometry>[]>([]);
  const { data, dataUpdatedAt, errorUpdatedAt, isPaused, isError, isPending, isFetching } = useFeatureData('harbor');
  const { data: fairwayCardData } = useFairwayCardListData();

  useEffect(() => {
    if (data && fairwayCardData) {
      const format = new GeoJSON();
      const harborFeatures = format.readFeatures(data, { dataProjection: 'EPSG:4326', featureProjection: MAP.EPSG });
      addFairwayCardData(harborFeatures, fairwayCardData.fairwayCards);
      setHarborFeatures(harborFeatures);
      setReady(true);
    }
  }, [data, fairwayCardData]);
  return { ready, harborFeatures, dataUpdatedAt, errorUpdatedAt, isPaused, isError, isPending, isFetching };
}

export function useHarborLayer(): DvkLayerState {
  const layerId = 'harbor';
  const { ready, harborFeatures, dataUpdatedAt, errorUpdatedAt, isPaused, isError } = useHarborFeatures();

  useEffect(() => {
    const layer = dvkMap.getFeatureLayer(layerId);
    if (ready && layer.get('dataUpdatedAt') !== dataUpdatedAt) {
      const source = dvkMap.getVectorSource(layerId);
      source.clear();
      harborFeatures.forEach((f) => {
        f.set('dataSource', layerId, true);
        f.set('featureType', layerId, true);
      });
      source.addFeatures(harborFeatures);
      layer.set('dataUpdatedAt', dataUpdatedAt);
    }
    layer.set('errorUpdatedAt', errorUpdatedAt, true);
  }, [ready, harborFeatures, dataUpdatedAt, errorUpdatedAt, layerId]);

  return { ready, dataUpdatedAt, errorUpdatedAt, isPaused, isError };
}
