import React, { useRef, useState } from 'react';
import { IonCheckbox, IonItem, IonLabel, IonList, IonPopover } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { Lang, SelectOption } from '../utils/constants';
import { constructSelectOptionLabel, sortTypeSafeSelectOptions } from '../utils/common';
import type { CheckboxCustomEvent } from '@ionic/react';
import DropdownSearchInput from './DropdownSearchInput';

interface DropdownPopupProps {
  trigger: string;
  options: SelectOption[] | null;
  selected: number[];
  setSelected: (selected: number[]) => void;
  filteredItems: SelectOption[];
  setFilteredItems: (items: SelectOption[]) => void;
  setIsExpanded: (expanded: boolean) => void;
  checkValidity: () => void;
  showId?: boolean;
}

const DropdownPopup: React.FC<DropdownPopupProps> = ({
  trigger,
  options,
  selected,
  setSelected,
  filteredItems,
  setFilteredItems,
  setIsExpanded,
  checkValidity,
  showId,
}) => {
  const { i18n } = useTranslation(undefined, { keyPrefix: 'general' });
  const lang = i18n.resolvedLanguage as Lang;

  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLIonInputElement>(null);

  const focusSearchInput = () => {
    searchRef.current?.setFocus();
  };

  const blurSearchInput = () => {
    searchRef.current
      ?.getInputElement()
      .then((input) => input.blur())
      .catch((err) => console.error(err));
  };

  const isOptionSelected = (value: SelectOption) => {
    if (value === undefined) {
      return false;
    }
    return typeof value.id === 'number' && selected.includes(value.id);
  };

  const handleCheckboxChange = (event: CheckboxCustomEvent) => {
    const { checked, value } = event.detail;
    const updatedValues = checked ? [...selected, value.id] : selected.filter((selectedId) => selectedId !== value.id);
    setSelected(updatedValues);
  };

  const handlePopupOpen = () => {
    focusSearchInput();
  };

  const handlePopupClose = () => {
    setIsExpanded(false);
    setSearchQuery('');
    setFilteredItems(options ? sortTypeSafeSelectOptions(options, lang) : []);
    checkValidity();
  };

  return (
    <IonPopover
      trigger={trigger}
      className="multiSelect"
      showBackdrop={false}
      size="cover"
      dismissOnSelect={false}
      arrow={false}
      onDidPresent={handlePopupOpen}
      onDidDismiss={handlePopupClose}
    >
      <DropdownSearchInput
        ref={searchRef}
        options={options}
        setFilteredItems={setFilteredItems}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        blurSearchInput={blurSearchInput}
      />
      <IonList className="ion-no-padding">
        {filteredItems.map((item) => {
          const optionLabel = constructSelectOptionLabel(item, lang, showId);
          const optionSelected = isOptionSelected(item);
          return (
            <IonItem key={item.id.toString()} className="custom-select-option" lines="none">
              <IonCheckbox
                aria-label={optionLabel}
                checked={optionSelected}
                justify="start"
                labelPlacement="end"
                onIonChange={handleCheckboxChange}
                value={item}
              >
                <IonLabel color={optionSelected ? 'primary' : 'dark'}>{optionLabel}</IonLabel>
              </IonCheckbox>
            </IonItem>
          );
        })}
      </IonList>
    </IonPopover>
  );
};

export default DropdownPopup;
