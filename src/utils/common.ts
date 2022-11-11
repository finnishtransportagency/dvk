import { FairwayCardPartsFragment } from '../graphql/generated';
import { MAX_HITS, MINIMUM_QUERYLENGTH } from './constants';

export const getCurrentDecimalSeparator = () => {
  const n = 1.1;
  const sep = n.toLocaleString().substring(1, 2);
  return sep;
};

export const filterFairways = (data: FairwayCardPartsFragment[] | undefined, lang: 'fi' | 'sv' | 'en', searchQuery: string) => {
  if (searchQuery.length < MINIMUM_QUERYLENGTH) return [];
  return (data && data.filter((card) => (card.name[lang] || '').toString().toLowerCase().indexOf(searchQuery.trim()) > -1).slice(0, MAX_HITS)) || [];
};
