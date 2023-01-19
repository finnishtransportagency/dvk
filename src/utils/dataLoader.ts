import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
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
  return useFindAllSafetyEquipmentFaultsQuery(datasourceClient, undefined, { refetchOnMount: 'always' });
}

export function useWarineWarningsData() {
  return useFindAllMarineWarningsQuery(datasourceClient, undefined, { refetchOnMount: 'always' });
}
