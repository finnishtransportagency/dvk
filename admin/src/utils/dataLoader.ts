import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { FeatureDataId, FeatureDataSources } from './constants';

export function useFeatureData(featureDataId: FeatureDataId) {
  const fds = FeatureDataSources.find((fda) => fda.id === featureDataId);
  let urlStr: string;
  if (import.meta.env.VITE_APP_USE_STATIC_FEATURES === 'true') {
    urlStr = fds?.staticUrl ? fds.staticUrl.toString() : (fds?.url.toString() ?? '');
  } else {
    urlStr = fds?.url ? fds.url.toString() : '';
  }
  const response = useQuery({
    queryKey: [fds?.id],
    queryFn: async () => {
      const { data } = await axios.get(urlStr);
      return data;
    },
  });
  return {
    ...response,
    data: response.data?.data ? response.data.data : response.data,
  };
}

export function useStaticFeatureData(featureDataId: FeatureDataId) {
  return useFeatureData(featureDataId);
}
