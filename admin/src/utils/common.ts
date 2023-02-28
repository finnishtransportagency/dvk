import { FairwayCardOrHarbor } from '../graphql/generated';
import { Lang } from './constants';

export const filterItemList = (
  data: FairwayCardOrHarbor[] | undefined,
  lang: Lang,
  searchQuery: string,
  itemTypes: string[],
  sortBy: string,
  sortDescending: boolean
) => {
  return (
    data
      ?.filter(
        (item) =>
          (item.name[lang] || '').toLowerCase().indexOf(searchQuery.trim()) > -1 && (itemTypes.length > 0 ? itemTypes.indexOf(item.type) > -1 : true)
      )
      .sort((a, b) => {
        const nameA = a.name[lang] || '';
        const nameB = b.name[lang] || '';
        if (sortBy === 'name') return sortDescending ? nameB.localeCompare(nameA) : nameA.localeCompare(nameB);
        if (sortBy === 'type') return sortDescending ? b.type.localeCompare(a.type) : a.type.localeCompare(b.type);
        if (sortBy === 'area') return sortDescending ? Number(b.group) - Number(a.group) : Number(a.group) - Number(b.group);
        if (sortBy === 'referencelevel')
          return sortDescending
            ? Number(a.n2000HeightSystem) - Number(b.n2000HeightSystem)
            : Number(b.n2000HeightSystem) - Number(a.n2000HeightSystem);
        if (sortBy === 'status') return sortDescending ? b.status.localeCompare(a.status) : a.status.localeCompare(b.status);
        if (sortBy === 'creator')
          return sortDescending ? (b.creator || '').localeCompare(a.creator || '') : (a.creator || '').localeCompare(b.creator || '');
        if (sortBy === 'modifier')
          return sortDescending ? (b.modifier || '').localeCompare(a.modifier || '') : (a.modifier || '').localeCompare(b.modifier || '');
        if (sortBy === 'modified')
          return sortDescending
            ? Number(b.modificationTimestamp) - Number(a.modificationTimestamp)
            : Number(a.modificationTimestamp) - Number(b.modificationTimestamp);
        return 1;
      }) || []
  );
};
