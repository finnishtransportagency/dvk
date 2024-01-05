import { FairwayCardOrHarbor, Maybe, Text } from '../graphql/generated';
import { ActionType, ItemType, Lang, SelectOption } from './constants';

const sortByString = (a: Maybe<string> | undefined, b: Maybe<string> | undefined, sortDescending: boolean) => {
  const valA = a ?? '';
  const valB = b ?? '';
  return sortDescending ? valB.localeCompare(valA) : valA.localeCompare(valB);
};

const sortByNumber = (a: number, b: number, sortDescending: boolean) => {
  return sortDescending ? b - a : a - b;
};

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
        switch (sortBy) {
          case 'name':
            return sortByString(a.name[lang], b.name[lang], sortDescending);
          case 'type':
            return sortByString(a.type, b.type, sortDescending);
          case 'area':
            return sortByNumber(Number(a.group), Number(b.group), sortDescending);
          case 'referencelevel':
            return sortByNumber(Number(a.n2000HeightSystem), Number(b.n2000HeightSystem), !sortDescending);
          case 'status':
            return sortByString(a.status, b.status, sortDescending);
          case 'creator':
            return sortByString(a.creator, a.modifier, sortDescending);
          case 'modifier':
            return sortByString(a.modifier, b.modifier, sortDescending);
          case 'modified':
            return sortByNumber(Number(a.modificationTimestamp), Number(b.modificationTimestamp), sortDescending);
          default:
            return 1;
        }
      }) ?? []
  );
};

export const checkInputValidity = (
  inputRef: React.RefObject<HTMLIonInputElement>,
  setIsValid: React.Dispatch<React.SetStateAction<boolean>>,
  actionType: ActionType,
  setValidity?: (actionType: ActionType, val: boolean) => void,
  error?: string
) => {
  if (error) {
    setIsValid(false);
    if (setValidity) setValidity(actionType, false);
  } else {
    inputRef.current
      ?.getInputElement()
      .then((textinput) => {
        if (textinput) {
          setIsValid(textinput.checkValidity());
          if (setValidity) setValidity(actionType, textinput.checkValidity());
        }
      })
      .catch((err) => {
        console.error(err.message);
      });
  }
};

export const isInputOk = (isValid: boolean, error: string | undefined) => {
  return isValid && (!error || error === '');
};

export const getCombinedErrorAndHelperText = (helperText: string | null | undefined, errorText: string): string => {
  if (helperText) {
    return errorText.length > 0 ? errorText + '. ' + helperText : helperText;
  }
  return errorText;
};

export const getInputCounterText = (inputLength: number, maxLength: number) => {
  return inputLength > maxLength / 2 ? `${inputLength} / ${maxLength}` : '';
};

export const nameIncludesQuery = (name: Text | null | undefined, query: string) => {
  if (!name) return false;
  return name.fi?.toLowerCase().includes(query) || name.sv?.toLowerCase().includes(query) || name.en?.toLowerCase().includes(query);
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

export const constructSelectDropdownLabel = (selected: number[], options: SelectOption[] | null, lang: Lang, showId?: boolean): string[] => {
  if (selected.length > 0 && !!options && options.length > 0) {
    const sortedOptions = sortSelectOptions(options, lang);
    const selectedOptions = sortedOptions.filter((item) => !!item && typeof item.id === 'number' && selected.includes(item.id));
    return selectedOptions.map((item) => constructSelectOptionLabel(item, lang, showId));
  }
  return [];
};

export const radiansToDegrees = (rads: number) => {
  return Math.round(rads * (180 / Math.PI) + (rads < 0 ? 360 : 0));
};

export function openPreview(id: string, isCard: boolean) {
  const path = import.meta.env.VITE_APP_ENV === 'local' ? 'https://' + import.meta.env.VITE_APP_STATIC_URL : '';
  window.open(path + '/esikatselu/' + (isCard ? 'kortit/' : 'satamat/') + id);
}
