import React, { forwardRef } from 'react';
import { IonButton, IonIcon, IonInput, IonItem } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { Lang, SelectOption } from '../../utils/constants';
import { nameIncludesQuery, sortTypeSafeSelectOptions } from '../../utils/common';
import type { InputCustomEvent } from '@ionic/react';
import searchIcon from '../../theme/img/search.svg';
import closeIcon from '../../theme/img/close_primary.svg';

interface SelectDropdownFilterProps {
  options: SelectOption[] | null;
  setFilteredItems: (items: SelectOption[]) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  blurSearchInput: () => void;
}

const SelectDropdownFilter = forwardRef(function SelectDropdownSearchInput(
  props: SelectDropdownFilterProps,
  ref: React.ForwardedRef<HTMLIonInputElement>
) {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'general' });
  const lang = i18n.resolvedLanguage as Lang;
  const { options, setFilteredItems, searchQuery, setSearchQuery, blurSearchInput } = props;

  const filterList = (query: string) => {
    if (options) {
      const sortedOptions = sortTypeSafeSelectOptions(options, lang);
      if (query === '') {
        setFilteredItems(sortedOptions);
      } else {
        const normalizedQuery = query.toLowerCase();
        const filteredOptions = sortedOptions.filter((item) => {
          return item.id.toString().includes(normalizedQuery) || nameIncludesQuery(item.name, normalizedQuery);
        });
        setFilteredItems(filteredOptions);
      }
    } else {
      setFilteredItems([]);
    }
  };

  const searchBarInput = (e: InputCustomEvent) => {
    const value = e.target.value ?? '';
    setSearchQuery(value.toString());
    filterList(value.toString());
  };

  const clearInput = () => {
    setSearchQuery('');
    setFilteredItems(options ? sortTypeSafeSelectOptions(options, lang) : []);
  };

  const keyDownAction = (event: React.KeyboardEvent<HTMLIonInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      blurSearchInput();
    }
  };

  const searchHasInput = searchQuery.length > 0;

  return (
    <IonItem lines="full">
      <div className="dropdownSearchWrapper">
        <IonInput
          ref={ref}
          onIonInput={searchBarInput}
          onKeyDown={keyDownAction}
          placeholder={t('search-placeholder') ?? ''}
          title={t('search-title') ?? ''}
          value={searchQuery}
        />
        <IonButton className="clearSearch" disabled={!searchHasInput} fill="clear" onClick={clearInput} size="small">
          <IonIcon icon={searchHasInput ? closeIcon : searchIcon} slot="icon-only" className={searchHasInput ? 'closeIcon' : 'searchIcon'} />
        </IonButton>
      </div>
    </IonItem>
  );
});

export default SelectDropdownFilter;
