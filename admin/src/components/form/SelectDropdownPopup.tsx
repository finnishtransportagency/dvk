import React, { useRef, useState } from 'react';
import { IonCheckbox, IonItem, IonLabel, IonList, IonPopover } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { AreaSelectOption, Lang, SelectOption } from '../../utils/constants';
import { constructSelectOptionLabel, sortTypeSafeSelectOptions } from '../../utils/common';
import type { CheckboxCustomEvent } from '@ionic/react';
import SelectDropdownFilter from './SelectDropdownFilter';

interface SelectDropdownPopupProps {
  trigger: string;
  triggerRef: React.RefObject<HTMLIonItemElement | null>;
  options: SelectOption[] | AreaSelectOption[] | null;
  selected: number[];
  setSelected: (selected: number[]) => void;
  setIsExpanded: (expanded: boolean) => void;
  checkValidity: () => void;
  showId?: boolean;
  className?: string;
}

const SelectDropdownPopup: React.FC<SelectDropdownPopupProps> = ({
  trigger,
  triggerRef,
  options,
  selected,
  setSelected,
  setIsExpanded,
  checkValidity,
  showId,
  className,
}) => {
  const { i18n } = useTranslation(undefined, { keyPrefix: 'general' });
  const lang = i18n.resolvedLanguage as Lang;

  const [filteredItems, setFilteredItems] = useState<SelectOption[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const popover = useRef<HTMLIonPopoverElement>(null);
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
    // Set popover position by force based on mocked select field dimensions
    setTimeout(() => {
      (popover.current?.shadowRoot?.childNodes[1].childNodes[0] as HTMLElement).style.top =
        (triggerRef.current?.getBoundingClientRect().top ?? 0) + (triggerRef.current?.getBoundingClientRect().height ?? 0) + 'px';
    }, 0);
  };

  const handlePopupWillOpen = () => {
    setFilteredItems(options ? sortTypeSafeSelectOptions(options, lang) : []);
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
      ref={popover}
      trigger={trigger}
      className={'multiSelect' + (className ? ' ' + className : '')}
      showBackdrop={false}
      size="cover"
      dismissOnSelect={false}
      arrow={false}
      onWillPresent={handlePopupWillOpen}
      onDidPresent={handlePopupOpen}
      onDidDismiss={handlePopupClose}
      keepContentsMounted={true}
    >
      <SelectDropdownFilter
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
            <IonItem key={item.id.toString()} className={optionSelected ? 'option-selected' : ''} lines="none">
              <IonCheckbox
                aria-label={optionLabel}
                checked={optionSelected}
                justify="start"
                labelPlacement="end"
                onIonChange={handleCheckboxChange}
                value={item}
              >
                <IonLabel color={optionSelected ? 'primary' : 'dark'}>{optionLabel}</IonLabel>
                {'subtext' in item && (item as AreaSelectOption).subtext && (
                  <IonLabel color={optionSelected ? 'primary' : 'dark'} className="multiSelect subtext">
                    {(item as AreaSelectOption).subtext}
                  </IonLabel>
                )}
              </IonCheckbox>
            </IonItem>
          );
        })}
      </IonList>
    </IonPopover>
  );
};

export default SelectDropdownPopup;
