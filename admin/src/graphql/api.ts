import { UseMutationOptions } from '@tanstack/react-query/build/lib/types';
import {
  SaveFairwayCardMutation,
  SaveFairwayCardMutationVariables,
  SaveHarborMutation,
  SaveHarborMutationVariables,
  UploadMapPictureMutation,
  UploadMapPictureMutationVariables,
  useCurrentUserQuery,
  useFairwayCardByIdQuery,
  useFairwayCardsAndHarborsQuery,
  useFairwayCardsQuery,
  useFairwaysQuery,
  useHarborsQuery,
  useHarbourByIdQuery,
  usePilotPlacesQuery,
  useSaveFairwayCardMutation,
  useSaveHarborMutation,
  useUploadMapPictureMutation,
} from './generated';

const datasourceClient = {
  endpoint: process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL : '/yllapito/graphql',
  fetchParams: {
    headers: {
      'x-api-key': process.env.REACT_APP_API_KEY ?? 'key missing',
    },
  },
};

export function useCurrentUserQueryData() {
  return useCurrentUserQuery(datasourceClient, undefined, { refetchOnWindowFocus: false });
}

export function useFairwayCardsAndHarborsQueryData() {
  return useFairwayCardsAndHarborsQuery(datasourceClient, undefined, { refetchOnWindowFocus: false });
}

export function useFairwayCardByIdQueryData(id: string, refetchOnWindowFocus?: boolean) {
  return useFairwayCardByIdQuery(datasourceClient, { id }, { refetchOnWindowFocus: refetchOnWindowFocus });
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

export function useHarbourByIdQueryData(id: string, refetchOnWindowFocus?: boolean) {
  return useHarbourByIdQuery(datasourceClient, { id }, { refetchOnWindowFocus: refetchOnWindowFocus });
}

export function usePilotPlacesQueryData() {
  return usePilotPlacesQuery(datasourceClient, undefined, { refetchOnWindowFocus: false });
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
