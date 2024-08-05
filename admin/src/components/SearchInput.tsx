import React, { useRef, useState } from 'react';
import { IonInput, IonItem } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import SearchDropdown from './SearchDropdown';
import { FairwayCardOrHarbor } from '../graphql/generated';
import { filterItemList } from '../utils/common';
import { Lang } from '../utils/constants';
import './SearchInput.css';
import ClearSearchButton from './ClearSearchButton';

interface SearchProps {
  itemList: FairwayCardOrHarbor[];
  selectedItem: FairwayCardOrHarbor | undefined;
  setSelectedItem: (item: FairwayCardOrHarbor | undefined) => void;
  isDropdownOpen: boolean;
  setIsDropdownOpen: (isOpen: boolean) => void;
}

const SearchInput: React.FC<SearchProps> = ({ itemList, selectedItem, setSelectedItem, isDropdownOpen, setIsDropdownOpen }) => {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'general' });
  const lang = i18n.language as Lang;

  const [searchQuery, setSearchQuery] = useState('');
  const [activeSelection, setActiveSelection] = useState(0);
  const inputRef = useRef<HTMLIonInputElement>(null);
  const filteredList = filterItemList(itemList, lang, searchQuery, [], 'name', false);

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
  const selectAction = (item: FairwayCardOrHarbor | undefined) => {
    setSelectedItem(item);
    setSearchQuery('');
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

  return (
    <div id="fairwayCardOrHarborSearch" className="searchWrapper">
      <IonItem lines="none" className={'searchBar ' + (isDropdownOpen ? 'expanded' : '')}>
        <IonInput
          className="searchBar"
          placeholder={t('search-placeholder') ?? ''}
          title={t('search-title') ?? ''}
          value={isDropdownOpen ? searchQuery : (selectedItem?.name[lang] ?? selectedItem?.name.fi ?? '')}
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
        items={filteredList}
        selected={activeSelection}
        setSelectedItem={selectAction}
      />
    </div>
  );
};

export default SearchInput;
