import React, { useEffect, useRef, useState } from 'react';
import { IonButton, IonCheckbox, IonIcon, IonInput, IonItem, IonLabel, IonList, IonNote, IonPopover, IonSkeletonText } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { ActionType, Lang, SelectOption, ValueType } from '../utils/constants';
import {
  constructSelectDropdownLabel,
  constructSelectOptionLabel,
  getCombinedErrorAndHelperText,
  nameIncludesQuery,
  sortTypeSafeSelectOptions,
} from '../utils/common';
import type { CheckboxCustomEvent, InputCustomEvent } from '@ionic/react';
import { caretDownSharp, caretUpSharp, close, search } from 'ionicons/icons';

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
  const [expanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const selectRef = useRef<HTMLIonLabelElement>(null);
  const searchRef = useRef<HTMLIonInputElement>(null);

  const focusSelectItem = () => {
    selectRef.current?.click();
  };

  const focusSearchInput = () => {
    searchRef.current?.setFocus();
  };

  const blurSearchInput = () => {
    searchRef.current
      ?.getInputElement()
      .then((input) => input.blur())
      .catch((err) => console.error(err));
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

  const checkValidity = () => {
    setIsValid(required ? !error && selected.length > 0 : !error);
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
    setSelected(updatedValues, actionType);
  };

  const handlePopupClose = () => {
    setSearchQuery('');
    checkValidity();
  };

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

  useEffect(() => {
    if (options && options.length > 0) {
      const sortedOptions = sortTypeSafeSelectOptions(options, lang);
      setFilteredItems(sortedOptions);
    }
  }, [options, lang]);

  return (
    <div className={'selectWrapper' + (isValid && (!error || error === '') ? '' : ' invalid') + (disabled ? ' disabled' : '')}>
      <IonLabel className={'formLabel' + (disabled ? ' disabled' : '')} onClick={() => focusSelectItem()}>
        {label} {required ? '*' : ''}
      </IonLabel>
      {isLoading ? (
        <IonSkeletonText animated={true} className="select-skeleton" />
      ) : (
        <>
          <IonItem
            id="select-with-search"
            button={true}
            className={'custom-select-container' + (expanded ? ' expanded' : '')}
            detail={false}
            disabled={isLoading || disabled}
            lines="none"
          >
            <IonItem className={'custom-select-item' + (expanded ? ' expanded' : '')} detail={false} disabled={isLoading || disabled} lines="none">
              <IonLabel ref={selectRef} className="ion-text-wrap" color={selected.length > 0 ? 'dark' : 'medium'}>
                {selected.length > 0 ? constructSelectDropdownLabel(selected, options, lang, showId) : t('choose') ?? ''}
              </IonLabel>
              <IonIcon
                icon={expanded ? caretUpSharp : caretDownSharp}
                aria-hidden={true}
                className="custom-select-icon"
                color={expanded ? 'primary' : 'medium'}
              />
            </IonItem>
          </IonItem>
          {isValid && (!error || error === '') && getHelperText() && <IonNote className="helper">{getHelperText()}</IonNote>}
          <IonNote className="input-error">{getCombinedErrorAndHelperText(getHelperText(), getErrorText())}</IonNote>
          <IonPopover
            trigger="select-with-search"
            className="multiSelect"
            showBackdrop={false}
            size="cover"
            dismissOnSelect={false}
            arrow={false}
            onWillPresent={() => setIsExpanded(true)}
            onWillDismiss={() => setIsExpanded(false)}
            onDidPresent={() => focusSearchInput()}
            onDidDismiss={handlePopupClose}
          >
            <IonItem key="search-input-item" lines="full">
              <IonInput
                ref={searchRef}
                className="custom-select-search"
                onIonInput={(e) => searchBarInput(e)}
                onKeyDown={(e) => keyDownAction(e)}
                placeholder={t('search-placeholder') ?? ''}
                title={t('search-title') ?? ''}
                value={searchQuery}
              />
              <IonButton
                className="custom-select-search"
                disabled={searchQuery.length === 0}
                fill="clear"
                onClick={clearInput}
                size="small"
                slot="end"
              >
                <IonIcon icon={searchQuery.length > 0 ? close : search} slot="icon-only" />
              </IonButton>
            </IonItem>
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
        </>
      )}
    </div>
  );
};

export default SelectWithSearch;
