import axios from 'axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FeatureDataId, FeatureDataSources } from './constants';
import { useFindAllFairwayCardsQuery, useFindAllMarineWarningsQuery, useFindAllSafetyEquipmentFaultsQuery } from '../graphql/generated';

export function useFeatureData(featureDataId: FeatureDataId, refetchOnMount: 'always' | boolean = true, refetchInterval: number | false = false) {
  const fds = FeatureDataSources.find((fda) => fda.id === featureDataId);
  const urlStr = fds?.url ? fds.url.toString() : '';
  return useQuery({
    queryKey: [fds?.id],
    refetchOnMount,
    refetchInterval,
    queryFn: async () => {
      const { data } = await axios.get(urlStr);
      return data;
    },
  });
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
  return useFindAllFairwayCardsQuery(datasourceClient);
}

export function useSafetyEquipmentFaultData() {
  return useFindAllSafetyEquipmentFaultsQuery(datasourceClient);
}

export function useSafetyEquipmentFaultDataWithLinkedDataInvalidation() {
  const queryClient = useQueryClient();
  queryClient.invalidateQueries({ queryKey: ['safetyequipment'] });
  queryClient.invalidateQueries({ queryKey: ['safetyequipmentfault'] });
  return useFindAllSafetyEquipmentFaultsQuery(datasourceClient, undefined, { refetchOnMount: 'always' });
}

export function useMarineWarningsData() {
  return useFindAllMarineWarningsQuery(datasourceClient);
}
export function useMarineWarningsDataWithLinkedDataInvalidation() {
  const queryClient = useQueryClient();
  queryClient.invalidateQueries({ queryKey: ['marinewarning'] });
  queryClient.invalidateQueries({ queryKey: ['safetyequipment'] });
  queryClient.invalidateQueries({ queryKey: ['line12'] });
  queryClient.invalidateQueries({ queryKey: ['line3456'] });
  queryClient.invalidateQueries({ queryKey: ['area12'] });
  queryClient.invalidateQueries({ queryKey: ['area3456'] });
  return useFindAllMarineWarningsQuery(datasourceClient, undefined, { refetchOnMount: 'always' });
}
