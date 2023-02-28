import { useCurrentUserQuery, useFairwayCardsAndHarborsQuery } from './generated';

const datasourceClient = {
  endpoint: process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL : '/graphql',
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
