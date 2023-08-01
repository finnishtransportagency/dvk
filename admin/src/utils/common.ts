import { FairwayCardOrHarbor, Text } from '../graphql/generated';
import { ItemType, Lang, SelectOption } from './constants';

export const filterItemList = (
  data: FairwayCardOrHarbor[] | undefined,
  lang: Lang,
  searchQuery: string,
  itemTypes: ItemType[],
  sortBy: string,
  sortDescending: boolean
) => {
  return (
    data
      ?.filter(
        (item) =>
          (item.name[lang] ?? '').toLowerCase().indexOf(searchQuery.trim().toLowerCase()) > -1 &&
          (itemTypes.length > 0 ? itemTypes.indexOf(item.type) > -1 : true)
      )
      .sort((a, b) => {
        const nameA = a.name[lang] ?? '';
        const nameB = b.name[lang] ?? '';
        if (sortBy === 'name') return sortDescending ? nameB.localeCompare(nameA) : nameA.localeCompare(nameB);
        if (sortBy === 'type') return sortDescending ? b.type.localeCompare(a.type) : a.type.localeCompare(b.type);
        if (sortBy === 'area') return sortDescending ? Number(b.group) - Number(a.group) : Number(a.group) - Number(b.group);
        if (sortBy === 'referencelevel')
          return sortDescending
            ? Number(a.n2000HeightSystem) - Number(b.n2000HeightSystem)
            : Number(b.n2000HeightSystem) - Number(a.n2000HeightSystem);
        if (sortBy === 'status') return sortDescending ? b.status.localeCompare(a.status) : a.status.localeCompare(b.status);
        if (sortBy === 'creator')
          return sortDescending ? (b.creator ?? '').localeCompare(a.creator ?? '') : (a.creator ?? '').localeCompare(b.creator ?? '');
        if (sortBy === 'modifier')
          return sortDescending ? (b.modifier ?? '').localeCompare(a.modifier ?? '') : (a.modifier ?? '').localeCompare(b.modifier ?? '');
        if (sortBy === 'modified')
          return sortDescending
            ? Number(b.modificationTimestamp) - Number(a.modificationTimestamp)
            : Number(a.modificationTimestamp) - Number(b.modificationTimestamp);
        return 1;
      }) ?? []
  );
};

export const getCombinedErrorAndHelperText = (helperText: string | null | undefined, errorText: string): string => {
  if (helperText) {
    return errorText.length > 0 ? errorText + '. ' + helperText : helperText;
  }
  return errorText;
};

export const nameIncludesQuery = (name: Text | null | undefined, query: string) => {
  if (!name) return false;
  return (
    (name.fi != null && name.fi.toLowerCase().includes(query)) ||
    (name.sv != null && name.sv.toLowerCase().includes(query)) ||
    (name.en != null && name.en.toLowerCase().includes(query))
  );
};

export const sortSelectOptions = (options: SelectOption[], lang: Lang) => {
  return options.sort((a, b) => {
    const nameA = (typeof a.name === 'string' ? a.name : a.name?.[lang]) ?? '';
    const nameB = (typeof b.name === 'string' ? b.name : b.name?.[lang]) ?? '';
    return nameA.localeCompare(nameB);
  });
};

export const sortTypeSafeSelectOptions = (options: SelectOption[], lang: Lang) => {
  const filteredOptions = options.filter((item) => !!item && typeof item.id === 'number');
  return sortSelectOptions(filteredOptions, lang);
};

export const constructSelectOptionLabel = (item: SelectOption, lang: Lang, showId?: boolean): string => {
  const nameLabel = (item.name && (item.name[lang] || item.name.fi)) || item.id.toString();
  return showId ? '[' + item.id + '] ' + nameLabel : nameLabel;
};

export const constructSelectDropdownLabel = (selected: number[], options: SelectOption[] | null, lang: Lang, showId?: boolean): string => {
  if (selected.length > 0 && !!options && options.length > 0) {
    const sortedOptions = sortSelectOptions(options, lang);
    const selectedOptions = sortedOptions.filter((item) => !!item && typeof item.id === 'number' && selected.includes(item.id));
    return selectedOptions.map((item) => constructSelectOptionLabel(item, lang, showId)).join(', ');
  }
  return '';
};
