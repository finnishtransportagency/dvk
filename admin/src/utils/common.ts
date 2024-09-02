import { TFunction } from 'i18next';
import {
  FairwayCardOrHarbor,
  Mareograph,
  Maybe,
  Orientation,
  PictureInput,
  SelectedFairwayInput,
  Status,
  TemporaryNotification,
  Text,
} from '../graphql/generated';
import { ItemType, Lang, SelectOption } from './constants';
import { FeatureCollection } from 'geojson';
import { compareAsc, format, isValid, parse, parseISO } from 'date-fns';

const sortByString = (a: Maybe<string> | undefined, b: Maybe<string> | undefined, sortDescending: boolean) => {
  const valA = a ?? '';
  const valB = b ?? '';

  if (valA.startsWith('-')) {
    return sortDescending ? -1 : 1;
  }
  if (valB.startsWith('-')) {
    return sortDescending ? 1 : -1;
  }
  return sortDescending ? valB.localeCompare(valA) : valA.localeCompare(valB);
};

const sortByNumber = (a: number, b: number, sortDescending: boolean) => {
  return sortDescending ? b - a : a - b;
};

function searchQueryMatches(searchQuery: string, lang: Lang, name: Text, id: string) {
  return (
    (name[lang] ?? '').toLowerCase().indexOf(searchQuery.trim().toLowerCase()) > -1 ||
    (id ?? '').toLowerCase().indexOf(searchQuery.trim().toLowerCase()) > -1
  );
}

export const filterItemList = (
  data: FairwayCardOrHarbor[] | undefined,
  lang: Lang,
  searchQuery: string,
  itemTypes: ItemType[],
  itemStatus: Status[],
  sortBy: string,
  sortDescending: boolean,
  t?: TFunction
) => {
  const groups = t ? ['-', t('archipelagoSea'), t('gulfOfFinland'), t('gulfOfBothnia')] : [];
  return (
    data
      ?.filter(
        (item) =>
          searchQueryMatches(searchQuery, lang, item.name, item.id) &&
          (itemTypes.length > 0 ? itemTypes.indexOf(item.type) > -1 : true) &&
          (itemStatus.length > 0 ? itemStatus.indexOf(item.status) > -1 : true)
      )
      .sort((a, b) => {
        switch (sortBy) {
          case 'name':
            return sortByString(a.name[lang], b.name[lang], sortDescending);
          case 'type':
            return sortByString(t!(`item-type-${a.type}`), t!(`item-type-${b.type}`), sortDescending);
          case 'area':
            return sortByString(groups[Number(a.group ?? 0)], groups[Number(b.group ?? 0)], sortDescending);
          case 'referencelevel':
            return sortByNumber(Number(a.n2000HeightSystem), Number(b.n2000HeightSystem), sortDescending);
          case 'status':
            return sortByString(t!(`item-status-${a.status}`), t!(`item-status-${b.status}`), sortDescending);
          case 'creator':
            return sortByString(a.creator, b.creator, sortDescending);
          case 'modifier':
            return sortByString(a.modifier, b.modifier, sortDescending);
          case 'modified':
            // should be newest first when arrow down hence "!sortDescending"
            return sortByNumber(Number(a.modificationTimestamp), Number(b.modificationTimestamp), !sortDescending);
          case 'notice':
            return sortByString(a.temporaryNotifications?.[0]?.content?.[lang], b.temporaryNotifications?.[0]?.content?.[lang], !sortDescending);
          case 'identifier':
            return sortByString(a.id, b.id, sortDescending);
          case 'version':
            // should be newest first when arrow down hence "!sortDescending"
            return sortByNumber(Number(a.version.slice(1)), Number(b.version.slice(1)), !sortDescending);
          default:
            return 1;
        }
      }) ?? []
  );
};

export type FairwayCardOrHarborGroup = {
  id: string;
  items: FairwayCardOrHarbor[];
};

export function filterItemGroups(data: FairwayCardOrHarborGroup[], lang: Lang, searchQuery: string) {
  return data.filter((value) => {
    return value.items.some((item) => searchQueryMatches(searchQuery, lang, item.name, item.id));
  });
}

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
  window.open(path + '/esikatselu/' + (isCard ? 'kortit/' : 'satamat/') + id, '_blank');
}

function hasGroupId(sequenceObject: PictureInput | SelectedFairwayInput): sequenceObject is PictureInput {
  return (sequenceObject as PictureInput).groupId !== undefined;
}

export function removeSequence(
  option: PictureInput | SelectedFairwayInput,
  options: PictureInput[] | SelectedFairwayInput[],
  currentSequenceNumber: number
) {
  return options.map((o) => {
    if (o.id === option.id || (hasGroupId(o) && hasGroupId(option) && option.groupId && o.groupId === option.groupId)) {
      o.sequenceNumber = null;
    } else if (o.sequenceNumber && o.sequenceNumber > currentSequenceNumber) {
      o.sequenceNumber--;
    }
    return o;
  });
}

export function addSequence(option: PictureInput | SelectedFairwayInput, options: PictureInput[] | SelectedFairwayInput[]) {
  const sequencedPictures = options.filter((o) => !!o.sequenceNumber);
  const maxSequenceNumber = sequencedPictures.reduce((acc, o) => {
    return acc > (o.sequenceNumber ?? 0) ? acc : (o.sequenceNumber ?? 0);
  }, 0);

  return options.map((o) => {
    if (o.id === option.id || (hasGroupId(o) && hasGroupId(option) && o.groupId === option.groupId)) {
      o.sequenceNumber = (maxSequenceNumber ?? 0) + 1;
    }
    return o;
  });
}

export function sortPictures(pictures: PictureInput[]) {
  return pictures.sort((a, b) => {
    if (a.orientation === b.orientation) {
      return 0;
    } else if (a.orientation === Orientation.Portrait) {
      return -1;
    } else {
      return 1;
    }
  });
}

export function featureCollectionToSelectOptions(collection: FeatureCollection | undefined) {
  const propertyArray: SelectOption[] = [];
  collection?.features?.map((route) => {
    const properties = route.properties;
    const selectOption = {
      id: properties?.id,
      // name declared like this because of constructing label logic
      // related to SelectWithFilter
      name: {
        fi: properties?.name,
      },
    };
    propertyArray.push(selectOption);
  });

  return propertyArray;
}

export function checkIfValidAndChangeFormatToLocal(value: string | undefined | null) {
  if (value && !dateError(value)) {
    const date = value.split('T')[0];
    const parsedDate = parseISO(date);
    if (isValid(parsedDate)) {
      return format(parsedDate, 'dd.MM.yyyy');
    }
  }

  return value;
}

export function checkIfValidAndChangeFormatToISO(value: string | undefined | null) {
  if (value && !dateError(value)) {
    const parsedDate = parse(value, 'dd.MM.yyyy', new Date());
    if (isValid(parsedDate)) {
      return format(parsedDate, 'yyyy-MM-dd');
    }
  }

  return value;
}

export function dateError(date?: string | null): boolean {
  // might return time as well, so split just in case
  date = date?.split('T')[0];
  if (date?.match('\\d{2}\\.\\d{2}\\.\\d{4}')) {
    return !isValid(parse(date, 'dd.MM.yyyy', new Date()));
  } else if (date?.match('\\d{4}\\-\\d{2}\\-\\d{2}')) {
    return !isValid(parse(date, 'yyyy-MM-dd', new Date()));
  }
  return true;
}

export function endDateError(startDate: string, endDate: string): boolean {
  if (!startDate || !endDate) {
    return false;
  }
  endDate = endDate?.split('T')[0];
  startDate = startDate?.split('T')[0];
  const result = compareAsc(startDate, endDate);
  // result = -1 startDate is before endDate, result = 0 equal dates, result = 1 startDate is after endDate
  if (result === -1 || result === 0) {
    return false;
  }

  return true;
}

export type NoticeListingTypes = {
  active: number;
  incoming: number;
};

export function getNotificationListingTypesCount(notifications: TemporaryNotification[]): NoticeListingTypes {
  const currentDate = new Date().setHours(0, 0, 0, 0);

  const active = notifications?.filter((notification) => {
    if (!notification.startDate) {
      return false;
    }
    const startDate = new Date(notification?.startDate).setHours(0, 0, 0, 0);
    // if not endDate, give it a current date so it's counted as an active
    const endDate = new Date(notification?.endDate ?? currentDate).setHours(0, 0, 0, 0);

    return compareAsc(currentDate, startDate) >= 0 && compareAsc(endDate, currentDate) >= 0;
  });

  const incoming = notifications?.filter((notification) => {
    if (!notification.startDate) {
      return false;
    }
    const startDate = new Date(notification?.startDate).setHours(0, 0, 0, 0);

    return compareAsc(currentDate, startDate) === -1;
  });

  return {
    active: active.length,
    incoming: incoming.length,
  };
}

// when api returns language versions this can be deleted (db changes necessary too)
// when deleted, remember that filtering should be happening somewhere else
export function mareographsToSelectOptionList(mareographs: Mareograph[] | undefined) {
  if (!mareographs) {
    return [];
  }

  const nonCalculatedMareographs = mareographs.filter((mareograph) => !mareograph.calculated);

  return nonCalculatedMareographs.map((mareograph) => {
    return {
      id: mareograph.id,
      name: {
        fi: mareograph.name,
      },
    };
  });
}
