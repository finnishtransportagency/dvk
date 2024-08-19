import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { FeatureDataId, FeatureDataSources, OFFLINE_STORAGE } from './constants';

export function useFeatureData(
  featureDataId: FeatureDataId,
  refetchOnMount: 'always' | boolean = false,
  refetchInterval: number | false = false,
  staleTime: number = OFFLINE_STORAGE.staleTime,
  gcTime: number = OFFLINE_STORAGE.cacheTime
) {
  const fds = FeatureDataSources.find((fda) => fda.id === featureDataId);
  let urlStr: string;
  if (import.meta.env.VITE_APP_USE_STATIC_FEATURES === 'true') {
    urlStr = fds?.staticUrl ? fds.staticUrl.toString() : (fds?.url.toString() ?? '');
  } else {
    urlStr = fds?.url ? fds.url.toString() : '';
  }
  const response = useQuery({
    queryKey: [fds?.id],
    refetchOnMount,
    refetchInterval,
    staleTime,
    gcTime,
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

export function useStaticFeatureData(
  featureDataId: FeatureDataId,
  refetchOnMount: 'always' | boolean = true,
  refetchInterval: number | false = false
) {
  return useFeatureData(featureDataId, refetchOnMount, refetchInterval, OFFLINE_STORAGE.staleTimeStatic, OFFLINE_STORAGE.cacheTimeStatic);
}
