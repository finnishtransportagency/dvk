import React, { useEffect, useRef, useState } from 'react';
import { IonCheckbox, IonItem, IonLabel, IonList, IonNote, IonPopover, IonSearchbar, IonSkeletonText } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { ActionType, Lang, SelectOption, ValueType } from '../utils/constants';
import {
  constructSelectDropdownLabel,
  constructSelectOptionLabel,
  getCombinedErrorAndHelperText,
  nameIncludesQuery,
  sortTypeSafeSelectOptions,
} from '../utils/common';
import type { CheckboxCustomEvent, SearchbarCustomEvent } from '@ionic/react';

interface SelectWithSearchProps {
  label: string;
  selected: number[];
  options: SelectOption[] | null;
  setSelected: (value: ValueType, actionType: ActionType) => void;
  actionType: ActionType;
  required?: boolean;
  showId?: boolean;
  disabled?: boolean;
  helperText?: string | null;
  error?: string;
  isLoading?: boolean;
}

const SelectWithSearch: React.FC<SelectWithSearchProps> = ({
  label,
  selected,
  options,
  setSelected,
  actionType,
  required,
  showId,
  disabled,
  helperText,
  error,
  isLoading,
}) => {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'general' });
  const lang = i18n.resolvedLanguage as Lang;

  const [filteredItems, setFilteredItems] = useState<SelectOption[]>([]);
  const [isValid, setIsValid] = useState(error ? false : true);

  const selectRef = useRef<HTMLIonSelectElement>(null);

  const focusInput = () => {
    selectRef.current?.click();
  };

  const isOptionSelected = (value: SelectOption) => {
    if (value === undefined) {
      return false;
    }
    return typeof value.id === 'number' && selected.includes(value.id);
  };

  const checkValidity = () => {
    setIsValid(required ? !error && selected.length > 0 : !error);
  };

  const handleChange = (event: CheckboxCustomEvent) => {
    const { checked, value } = event.detail;
    const updatedValues = checked ? [...selected, value.id] : selected.filter((selectedId) => selectedId !== value.id);
    setSelected(updatedValues, actionType);
  };

  const getHelperText = () => {
    if (helperText) return helperText;
    return t('multiple-values-supported');
  };

  const getErrorText = () => {
    if (error) return error;
    if (!isValid) return t('required-field');
    return '';
  };

  const filterList = (searchQuery: string | null | undefined) => {
    if (options) {
      const sortedOptions = sortTypeSafeSelectOptions(options, lang);
      if (searchQuery === undefined || searchQuery === null) {
        setFilteredItems(sortedOptions);
      } else {
        const normalizedQuery = searchQuery.toLowerCase();
        const filteredOptions = sortedOptions.filter((item) => {
          return item.id.toString().includes(normalizedQuery) || nameIncludesQuery(item.name, normalizedQuery);
        });
        setFilteredItems(filteredOptions);
      }
    } else {
      setFilteredItems([]);
    }
  };

  const searchBarInput = (e: SearchbarCustomEvent) => {
    filterList(e.target.value);
  };

  useEffect(() => {
    if (options && options.length > 0) {
      const sortedOptions = sortTypeSafeSelectOptions(options, lang);
      setFilteredItems(sortedOptions);
    }
  }, [options, lang]);

  return (
    <div className={'selectWrapper' + (isValid && (!error || error === '') ? '' : ' invalid') + (disabled ? ' disabled' : '')}>
      <IonLabel className={'formLabel' + (disabled ? ' disabled' : '')} onClick={() => focusInput()}>
        {label} {required ? '*' : ''}
      </IonLabel>
      <IonItem button={true} detail={false} id="select-with-search" disabled={isLoading || disabled}>
        {isLoading ? (
          <IonSkeletonText animated={true} className="select-skeleton" />
        ) : (
          <IonLabel ref={selectRef} className="ion-text-wrap">
            {constructSelectDropdownLabel(selected, options, lang, showId)}
          </IonLabel>
        )}
        {/* <IonSelect
              ref={selectRef}
              placeholder={t('choose') ?? ''}
              interface="popover"
              onIonChange={(ev) => handleChange(ev)}
              onIonBlur={() => checkValidity()}
              interfaceOptions={{
                size: 'cover',
                className: 'multiSelect',
              }}
              value={selected}
              multiple={Array.isArray(selected) || multiple}
              compareWith={Array.isArray(selected) ? compareOptions : undefined}
              disabled={disabled}
              fill="outline"
              labelPlacement="stacked"
            >
            </IonSelect> */}
      </IonItem>
      {!isLoading && (
        <>
          {isValid && (!error || error === '') && getHelperText() && <IonNote className="helper">{getHelperText()}</IonNote>}
          <IonNote className="input-error">{getCombinedErrorAndHelperText(getHelperText(), getErrorText())}</IonNote>
        </>
      )}
      <IonPopover
        trigger="select-with-search"
        className="multiSelect"
        showBackdrop={false}
        size="cover"
        dismissOnSelect={false}
        arrow={false}
        onDidDismiss={() => checkValidity()}
      >
        <IonList>
          <IonItem key="search-input-item" lines="full">
            <IonSearchbar placeholder={t('search-placeholder') ?? ''} onIonInput={searchBarInput} />
          </IonItem>
          {filteredItems.map((item) => {
            const optionLabel = constructSelectOptionLabel(item, lang, showId);
            return (
              <IonItem key={item.id.toString()} lines="none">
                <IonCheckbox
                  aria-label={optionLabel}
                  value={item}
                  checked={isOptionSelected(item)}
                  onIonChange={handleChange}
                  justify="start"
                  labelPlacement="end"
                >
                  {optionLabel}
                </IonCheckbox>
              </IonItem>
            );
          })}
        </IonList>
      </IonPopover>
    </div>
  );
};

export default SelectWithSearch;
