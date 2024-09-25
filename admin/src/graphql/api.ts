import { UseMutationOptions } from '@tanstack/react-query';
import {
  SaveFairwayCardMutation,
  SaveFairwayCardMutationVariables,
  SaveHarborMutation,
  SaveHarborMutationVariables,
  UploadMapPictureMutation,
  UploadMapPictureMutationVariables,
  useCurrentUserQuery,
  useFairwayCardByIdQuery,
  useFairwayCardLatestByIdQuery,
  useFairwayCardsAndHarborsQuery,
  useFairwayCardsQuery,
  useFairwaysQuery,
  useHarborsQuery,
  useHarbourByIdQuery,
  useHarbourLatestByIdQuery,
  useMareographsQuery,
  usePilotPlacesQuery,
  useSaveFairwayCardMutation,
  useSaveHarborMutation,
  useUploadMapPictureMutation,
} from './generated';

const datasourceClient = {
  endpoint: import.meta.env.VITE_APP_API_URL ? import.meta.env.VITE_APP_API_URL : '/yllapito/graphql',
  fetchParams: {
    headers: {
      'content-type': 'application/json;charset=UTF-8',
      'x-api-key': import.meta.env.VITE_APP_API_KEY ?? 'key missing',
    },
  },
};

export function useCurrentUserQueryData() {
  return useCurrentUserQuery(datasourceClient, undefined, { refetchOnWindowFocus: false });
}

export function useFairwayCardsAndHarborsQueryData(getAllVersions: boolean) {
  return useFairwayCardsAndHarborsQuery(datasourceClient, { getAllVersions }, { refetchOnWindowFocus: false });
}

export function useFairwayCardByIdQueryData(id: string, version: string = 'v0_latest', refetchOnWindowFocus?: boolean) {
  return useFairwayCardByIdQuery(datasourceClient, { id, version }, { refetchOnWindowFocus: refetchOnWindowFocus });
}

export function useFairwayCardLatestByIdQueryData(id: string) {
  return useFairwayCardLatestByIdQuery(datasourceClient, { id }, { refetchOnWindowFocus: false });
}

export function useFairwaysQueryData() {
  return useFairwaysQuery(datasourceClient, undefined, { refetchOnWindowFocus: false, refetchOnMount: false });
}

export function useFairwayCardsQueryData() {
  return useFairwayCardsQuery(datasourceClient, undefined, { refetchOnWindowFocus: false });
}

export function useHarboursQueryData() {
  return useHarborsQuery(datasourceClient, undefined, { refetchOnWindowFocus: false });
}

export function useHarbourByIdQueryData(id: string, version: string = 'v0_latest', refetchOnWindowFocus?: boolean) {
  return useHarbourByIdQuery(datasourceClient, { id, version }, { refetchOnWindowFocus: refetchOnWindowFocus });
}

export function useHarbourLatestByIdQueryData(id: string) {
  return useHarbourLatestByIdQuery(datasourceClient, { id }, { refetchOnWindowFocus: false });
}

export function usePilotPlacesQueryData() {
  return usePilotPlacesQuery(datasourceClient, undefined, { refetchOnWindowFocus: false });
}

export function useMareographQueryData() {
  return useMareographsQuery(datasourceClient, undefined, { refetchOnWindowFocus: false });
}

export function useSaveFairwayCardMutationQuery<TError = unknown, TContext = unknown>(
  options?: UseMutationOptions<SaveFairwayCardMutation, TError, SaveFairwayCardMutationVariables, TContext>
) {
  return useSaveFairwayCardMutation(datasourceClient, options);
}

export function useSaveHarborMutationQuery<TError = unknown, TContext = unknown>(
  options?: UseMutationOptions<SaveHarborMutation, TError, SaveHarborMutationVariables, TContext>
) {
  return useSaveHarborMutation(datasourceClient, options);
}

export function useUploadMapPictureMutationQuery<TError = unknown, TContext = unknown>(
  options?: UseMutationOptions<UploadMapPictureMutation, TError, UploadMapPictureMutationVariables, TContext>
) {
  return useUploadMapPictureMutation(datasourceClient, options);
}
