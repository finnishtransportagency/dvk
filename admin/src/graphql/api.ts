import {
  useCurrentUserQuery,
  useFairwayCardByIdQuery,
  useFairwayCardsAndHarborsQuery,
  useFairwaysQuery,
  useHarborsQuery,
  useHarbourByIdQuery,
} from './generated';

const datasourceClient = {
  endpoint: process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL : '/yllapito/graphql',
  fetchParams: {
    headers: {
      'x-api-key': process.env.REACT_APP_API_KEY || 'key missing',
    },
  },
};

export function useCurrentUserQueryData() {
  return useCurrentUserQuery(datasourceClient);
}

export function useFairwayCardsAndHarborsQueryData() {
  return useFairwayCardsAndHarborsQuery(datasourceClient);
}

export function useFairwayCardByIdQueryData(id: string, refetchOnWindowFocus?: boolean) {
  return useFairwayCardByIdQuery(datasourceClient, { id }, { refetchOnWindowFocus: refetchOnWindowFocus });
}

export function useFairwaysQueryData() {
  return useFairwaysQuery(datasourceClient);
}

export function useHarboursQueryData() {
  return useHarborsQuery(datasourceClient);
}

export function useHarbourByIdQueryData(id: string, refetchOnWindowFocus?: boolean) {
  return useHarbourByIdQuery(datasourceClient, { id }, { refetchOnWindowFocus: refetchOnWindowFocus });
}
