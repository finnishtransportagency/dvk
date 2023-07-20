import React, { useEffect, useRef, useState } from 'react';
import { IonCheckbox, IonItem, IonLabel, IonList, IonNote, IonPopover, IonSkeletonText } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { ActionType, Lang, ValueType } from '../utils/constants';
import { Text } from '../graphql/generated';
import type { CheckboxCustomEvent } from '@ionic/react';
import { getCombinedErrorAndHelperText, nameIncludesQuery } from '../utils/common';

interface SelectOption {
  id: number;
  name?: Text | null;
}

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

  const sortedOptions = options?.sort((a, b) => {
    const nameA = (typeof a.name === 'string' ? a.name : a.name?.[lang]) ?? '';
    const nameB = (typeof b.name === 'string' ? b.name : b.name?.[lang]) ?? '';
    return nameA.localeCompare(nameB);
  });

  const [filteredItems, setFilteredItems] = useState<SelectOption[]>([]);
  const [isValid, setIsValid] = useState(error ? false : true);
  const [isTouched, setIsTouched] = useState(false);

  const selectRef = useRef<HTMLIonSelectElement>(null);

  const focusInput = () => {
    selectRef.current?.click();
  };

  const isOptionSelected = (value: number) => {
    if (value === undefined) {
      return false;
    }
    return selected.includes(value);
  };

  const checkValidity = (event?: CheckboxCustomEvent) => {
    const validity = event ? !!event.detail.value : selected.length > 0;
    setIsValid(required ? validity && !error : true);
    setIsTouched(true);
  };

  const handleChange = (event: CheckboxCustomEvent) => {
    const { checked, value } = event.detail;
    if (isTouched) checkValidity(event);
    const updatedValues = checked ? [...selected, value] : selected.filter((item) => item !== value);
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
    if (!options) {
      setFilteredItems([]);
      return;
    }
    if (searchQuery === undefined || searchQuery === null) {
      setFilteredItems([...options]);
    } else {
      const normalizedQuery = searchQuery.toLowerCase();
      const filteredOptions = options.filter((item) => {
        return item.id.toString().includes(searchQuery) || nameIncludesQuery(item.name, searchQuery);
      });
      setFilteredItems(filteredOptions);
    }
  };

  useEffect(() => {
    if (isTouched) {
      setIsValid(required ? selected.length > 0 && !error : true);
    }
  }, [required, error, selected, isTouched]);

  return (
    <div className={'selectWrapper' + (isValid && (!error || error === '') ? '' : ' invalid') + (disabled ? ' disabled' : '')}>
      <IonLabel className={'formLabel' + (disabled ? ' disabled' : '')} onClick={() => focusInput()}>
        {label} {required ? '*' : ''}
      </IonLabel>
      <IonItem button={true} detail={false} id="select-with-search" disabled={isLoading || disabled}>
        {isLoading ? <IonSkeletonText animated={true} className="select-skeleton" /> : <IonLabel ref={selectRef}></IonLabel>}
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
      <IonPopover trigger="select-with-search" className="multiSelect" showBackdrop={false} size="cover" dismissOnSelect={false} arrow={false}>
        <IonList>
          {sortedOptions?.map((item) => {
            const optionLabel = (item.name && (item.name[lang] || item.name.fi)) || item.id;
            return (
              <IonItem key={item.id.toString()} lines="none">
                <IonCheckbox
                  slot="start"
                  aria-label={'select-' + optionLabel}
                  value={item.id}
                  checked={isOptionSelected(item.id)}
                  onIonChange={(e) => handleChange(e)}
                />
                {showId ? '[' + item.id + '] ' : ''}
                {optionLabel}
              </IonItem>
            );
          })}
        </IonList>
      </IonPopover>
    </div>
  );
};

export default SelectWithSearch;
