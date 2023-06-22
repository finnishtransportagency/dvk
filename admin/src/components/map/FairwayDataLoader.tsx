import { useEffect, useState } from 'react';
import { useFairwayCardListData } from '../../utils/dataLoader';
import { DvkLayerState } from './FeatureLoader';

export function useFairwayCardList(): DvkLayerState {
  const [ready, setReady] = useState(false);
  const { data, dataUpdatedAt, isError, errorUpdatedAt, isPaused } = useFairwayCardListData();
  useEffect(() => {
    if (data) {
      setReady(true);
    }
  }, [data]);
  return { ready, dataUpdatedAt, errorUpdatedAt, isPaused, isError };
}
