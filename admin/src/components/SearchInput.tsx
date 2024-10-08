import React, { Dispatch, SetStateAction, useRef, useState } from 'react';
import { IonInput, IonItem } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import SearchDropdown from './SearchDropdown';
import { FairwayCardOrHarborGroup, filterItemGroups, getDefiningVersionName } from '../utils/common';
import { Lang } from '../utils/constants';
import './SearchInput.css';
import ClearSearchButton from './ClearSearchButton';
import { FairwayCardOrHarbor } from '../graphql/generated';

interface SearchProps {
  itemList: FairwayCardOrHarborGroup[];
  selectedItem: FairwayCardOrHarborGroup | undefined;
  setSelectedItem: (item: FairwayCardOrHarborGroup | undefined) => void;
  isDropdownOpen: boolean;
  setIsDropdownOpen: (isOpen: boolean) => void;
  setVersion: Dispatch<SetStateAction<FairwayCardOrHarbor | undefined>>;
}

const SearchInput: React.FC<SearchProps> = ({ itemList, selectedItem, setSelectedItem, isDropdownOpen, setIsDropdownOpen, setVersion }) => {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'general' });
  const lang = i18n.language as Lang;

  const [searchQuery, setSearchQuery] = useState('');
  const [activeSelection, setActiveSelection] = useState(0);
  const inputRef = useRef<HTMLIonInputElement>(null);
  const filteredList = filterItemGroups(itemList, lang, searchQuery);

  const closeDropdown = () => {
    setIsDropdownOpen(false);
    inputRef.current
      ?.getInputElement()
      .then((textinput) => textinput.blur())
      .catch((err) => console.error(err));
  };
  const openDropdown = () => {
    setSearchQuery('');
    setActiveSelection(0);
    setIsDropdownOpen(true);
  };
  const changeAction = (val?: string | number | null) => {
    setSearchQuery(String(val));
    setActiveSelection(0);
  };
  const selectAction = (item: FairwayCardOrHarborGroup | undefined) => {
    setSelectedItem(item);
    setSearchQuery('');
    setVersion(undefined);
    closeDropdown();
  };
  const blurAction = () => {
    setTimeout(closeDropdown, 200);
  };

  const keyDownAction = (event: React.KeyboardEvent<HTMLIonInputElement>) => {
    if (event.key === 'Escape') blurAction();
    if (event.key === 'Tab' && isDropdownOpen) {
      event.preventDefault();
      setIsDropdownOpen(false);
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (isDropdownOpen && filteredList.length > 0) {
        setActiveSelection(activeSelection >= filteredList.length ? 1 : activeSelection + 1);
      }
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveSelection(activeSelection < 2 ? filteredList.length : activeSelection - 1);
    }
    if (event.key === 'Enter' && isDropdownOpen && activeSelection) {
      selectAction(filteredList[activeSelection - 1]);
    }
  };

  const clearInput = () => {
    selectAction(undefined);
    setSearchQuery('');
  };

  const searchHasInput = searchQuery.length > 0 || !!selectedItem;
  const selectedItemName = selectedItem ? getDefiningVersionName(selectedItem?.items, lang) : '';

  return (
    <div id="fairwayCardOrHarborSearch" className="searchWrapper">
      <IonItem lines="none" className={'searchBar ' + (isDropdownOpen ? 'expanded' : '')}>
        <IonInput
          className="searchBar"
          placeholder={t('search-placeholder') ?? ''}
          title={t('search-title') ?? ''}
          value={isDropdownOpen ? searchQuery : selectedItemName}
          onIonFocus={openDropdown}
          onIonInput={(e) => changeAction(e.detail.value)}
          onIonBlur={blurAction}
          onKeyDown={(e) => keyDownAction(e)}
          readonly={!isDropdownOpen}
          ref={inputRef}
        />
        <ClearSearchButton clearInput={clearInput} disabled={!searchHasInput} />
      </IonItem>
      <SearchDropdown
        isOpen={isDropdownOpen}
        searchQuery={searchQuery.trim()}
        itemList={filteredList}
        selected={activeSelection}
        setSelectedItem={selectAction}
      />
    </div>
  );
};

export default SearchInput;
