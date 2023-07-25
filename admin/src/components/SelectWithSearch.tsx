import React, { useEffect, useRef, useState } from 'react';
import {
  IonCheckbox,
  IonCol,
  IonGrid,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonPopover,
  IonRow,
  IonSearchbar,
  IonSkeletonText,
} from '@ionic/react';
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
import { caretDownSharp, caretUpSharp } from 'ionicons/icons';

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

  const selectRef = useRef<HTMLIonLabelElement>(null);

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
      <IonItem
        id="select-with-search"
        button={true}
        className={'custom-select' + (expanded ? ' expanded' : '')}
        detail={false}
        disabled={isLoading || disabled}
        lines="none"
      >
        {isLoading ? (
          <IonSkeletonText animated={true} className="select-skeleton" />
        ) : (
          <IonGrid className="ion-no-margin ion-no-padding">
            <IonRow className="ion-align-items-baseline ion-justify-content-between">
              <IonCol>
                <IonLabel ref={selectRef} className="ion-text-wrap" color={selected.length > 0 ? 'dark' : 'medium'}>
                  {selected.length > 0 ? constructSelectDropdownLabel(selected, options, lang, showId) : t('choose') ?? ''}
                </IonLabel>
              </IonCol>
              <IonCol>
                <IonIcon
                  icon={expanded ? caretUpSharp : caretDownSharp}
                  aria-hidden={true}
                  className="custom-select-icon"
                  color={expanded ? 'primary' : 'medium'}
                />
              </IonCol>
            </IonRow>
          </IonGrid>
        )}
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
        onWillPresent={() => setIsExpanded(true)}
        onWillDismiss={() => setIsExpanded(false)}
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
