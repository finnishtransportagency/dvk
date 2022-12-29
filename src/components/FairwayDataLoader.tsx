import { useEffect, useState } from 'react';
import { useFairwayCardListData } from '../utils/dataLoader';

export function useFairwayCardList() {
  const [ready, setReady] = useState(false);
  const { data } = useFairwayCardListData();
  useEffect(() => {
    if (data) {
      setReady(true);
    }
  }, [data]);
  return ready;
}
