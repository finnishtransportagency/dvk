import axios from 'axios';
import { useQuery, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import { FeatureDataId, FeatureDataSources } from './constants';
import {
  SaveFeedbackMutation,
  SaveFeedbackMutationVariables,
  Status,
  useFairwayCardPreviewQuery,
  useFindAllFairwayCardsQuery,
  useFindAllMarineWarningsQuery,
  useFindAllSafetyEquipmentFaultsQuery,
  useHarborPreviewQuery,
  useSaveFeedbackMutation,
  useWeatherLimitsQuery,
} from '../graphql/generated';
import { useEffect } from 'react';

export function useFeatureData(featureDataId: FeatureDataId, enabled: boolean = true) {
  const fds = FeatureDataSources.find((fda) => fda.id === featureDataId);
  let urlStr: string;
  if (import.meta.env.VITE_APP_USE_STATIC_FEATURES === 'true') {
    urlStr = fds?.staticUrl ? fds.staticUrl.toString() : (fds?.url.toString() ?? '');
  } else {
    urlStr = fds?.url ? fds.url.toString() : '';
  }
  const response = useQuery({
    queryKey: [fds?.id],
    meta: { persist: fds?.persist },
    refetchOnMount: fds?.refetchOnMount,
    refetchInterval: fds?.refetchInterval,
    staleTime: fds?.staleTime,
    gcTime: fds?.gcTime,
    queryFn: async () => {
      // get headers to get the real time of fetching from api
      const { data, headers } = await axios.get(urlStr);
      return { data, headers };
    },
    enabled,
  });
  return {
    ...response,
    data: response.data?.data ? response.data.data : response.data,
    headers: response.data?.headers,
  };
}
const fetchParams = {
  headers: {
    'content-type': 'application/json;charset=UTF-8',
    'x-api-key': import.meta.env.VITE_APP_API_KEY ?? 'key missing',
  },
};

const datasourceClient = {
  endpoint: import.meta.env.VITE_APP_API_URL ?? '/graphql',
  fetchParams: fetchParams,
};

const previewDataSourceClient = {
  // Use same API url for preview in local environment
  endpoint: import.meta.env.VITE_APP_API_URL ?? '/esikatselu/graphql',
  fetchParams: fetchParams,
};

export function useFairwayCardListData() {
  return useFindAllFairwayCardsQuery(datasourceClient, { status: [Status.Public] });
}

export function useFairwayCardPreviewData(id: string, isPreview: boolean, version: string = 'v0_latest') {
  return useFairwayCardPreviewQuery(
    previewDataSourceClient,
    { id: id, version: version },
    { staleTime: 0, gcTime: 5 * 60 * 1000, enabled: isPreview, meta: { persist: false } }
  );
}

export function useHarborPreviewData(id: string, version: string = 'v0_public') {
  return useHarborPreviewQuery(
    previewDataSourceClient,
    { id: id, version: version },
    { staleTime: 0, gcTime: 5 * 60 * 1000, enabled: id.length > 0, meta: { persist: false } }
  );
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

export function useSaveFeedback<TError = unknown, TContext = unknown>(
  options?: UseMutationOptions<SaveFeedbackMutation, TError, SaveFeedbackMutationVariables, TContext>
) {
  return useSaveFeedbackMutation(datasourceClient, options);
}

export function useWeatherLimits() {
  return useWeatherLimitsQuery(datasourceClient);
}
