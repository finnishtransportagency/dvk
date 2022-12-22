import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { FeatureDataId, FeatureDataSources } from './constants';

export function useFeatureData(featureDataId: FeatureDataId) {
  const fds = FeatureDataSources.find((fda) => fda.id === featureDataId);
  const urlStr = fds?.url ? fds.url.toString() : '';
  return useQuery({
    queryKey: [fds?.id],
    queryFn: async () => {
      const { data } = await axios.get(urlStr);
      return data;
    },
  });
}
