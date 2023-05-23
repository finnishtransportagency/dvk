import axios from 'axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FeatureDataId, FeatureDataSources, OFFLINE_STORAGE } from './constants';
import { Status, useFindAllFairwayCardsQuery, useFindAllMarineWarningsQuery, useFindAllSafetyEquipmentFaultsQuery } from '../graphql/generated';
import { useEffect } from 'react';

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
  return useFindAllFairwayCardsQuery(datasourceClient, { status: [Status.Public] });
}

export function useSafetyEquipmentFaultData() {
  return useFindAllSafetyEquipmentFaultsQuery(datasourceClient);
}

export function useSafetyEquipmentFaultDataWithRelatedDataInvalidation() {
  const queryClient = useQueryClient();
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['safetyequipment'] });
    queryClient.invalidateQueries({ queryKey: ['safetyequipmentfault'] });
  }, [queryClient]);
  return useFindAllSafetyEquipmentFaultsQuery(datasourceClient, undefined, { refetchOnMount: 'always' });
}

export function useMarineWarningsData() {
  return useFindAllMarineWarningsQuery(datasourceClient);
}
export function useMarineWarningsDataWithRelatedDataInvalidation() {
  const queryClient = useQueryClient();
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['marinewarning'] });
    queryClient.invalidateQueries({ queryKey: ['safetyequipment'] });
    queryClient.invalidateQueries({ queryKey: ['line12'] });
    queryClient.invalidateQueries({ queryKey: ['line3456'] });
    queryClient.invalidateQueries({ queryKey: ['area12'] });
    queryClient.invalidateQueries({ queryKey: ['area3456'] });
  }, [queryClient]);
  return useFindAllMarineWarningsQuery(datasourceClient, undefined, { refetchOnMount: 'always' });
}
