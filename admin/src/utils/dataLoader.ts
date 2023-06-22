import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { FeatureDataId, FeatureDataSources, OFFLINE_STORAGE } from './constants';
import { Status, useFindAllFairwayCardsQuery } from '../graphql/generated';

export function useFeatureData(
  featureDataId: FeatureDataId,
  refetchOnMount: 'always' | boolean = true,
  refetchInterval: number | false = false,
  staleTime: number = OFFLINE_STORAGE.staleTime,
  cacheTime: number = OFFLINE_STORAGE.cacheTime
) {
  const fds = FeatureDataSources.find((fda) => fda.id === featureDataId);
  let urlStr: string;
  if (process.env.REACT_APP_USE_STATIC_FEATURES === 'true') {
    urlStr = fds?.staticUrl ? fds.staticUrl.toString() : fds?.url.toString() || '';
  } else {
    urlStr = fds?.url ? fds.url.toString() : '';
  }
  const response = useQuery({
    queryKey: [fds?.id],
    refetchOnMount,
    refetchInterval,
    staleTime,
    cacheTime,
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

const datasourceClient = {
  endpoint: process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL : '/graphql',
  fetchParams: {
    headers: {
      'x-api-key': process.env.REACT_APP_API_KEY || 'key missing',
    },
  },
};

export function useFairwayCardListData() {
  return useFindAllFairwayCardsQuery(datasourceClient, { status: [Status.Public] }, { refetchOnWindowFocus: false });
}
