import React, { useEffect, useRef, useState } from 'react';
import { IonItem, IonLabel, IonNote, IonSelect, IonSelectOption, IonSkeletonText } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { ActionType, Lang, ValueType } from '../utils/constants';
import { PilotPlace, Text } from '../graphql/generated';
import { IonSelectCustomEvent } from '@ionic/core/dist/types/components';
import { getCombinedErrorAndHelperText } from '../utils/common';

interface SelectChangeEventDetail<ValueType> {
  value: ValueType;
}

interface SelectOption {
  id: number | string | boolean;
  name?: Text | null;
}

interface SelectProps {
  label: string;
  selected?: ValueType;
  options: SelectOption[] | PilotPlace[] | null;
  setSelected: (value: ValueType, actionType: ActionType) => void;
  actionType: ActionType;
  required?: boolean;
  multiple?: boolean;
  showId?: boolean;
  disabled?: boolean;
  helperText?: string | null;
  hideLabel?: boolean;
  error?: string;
  compareObjects?: boolean;
  isLoading?: boolean;
}

const FormSelect: React.FC<SelectProps> = ({
  label,
  selected,
  options,
  setSelected,
  actionType,
  required,
  multiple,
  showId,
  disabled,
  helperText,
  hideLabel,
  error,
  compareObjects,
  isLoading,
}) => {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'general' });
  const lang = i18n.resolvedLanguage as Lang;
  const sortedOptions = options?.sort((a, b) => {
    const nameA = (typeof a.name === 'string' ? a.name : a.name?.[lang]) ?? '';
    const nameB = (typeof b.name === 'string' ? b.name : b.name?.[lang]) ?? '';
    return nameA.localeCompare(nameB);
  });

  const selectRef = useRef<HTMLIonSelectElement>(null);
  const focusInput = () => {
    selectRef.current?.click();
  };

  const compareOptions = (o1: string | number | PilotPlace, o2: string | number | PilotPlace) => {
    if (!o1 || !o2) {
      return o1 === o2;
    }
    if (compareObjects && typeof o1 === 'object' && typeof o2 === 'object') {
      return o1.id === o2.id;
    }
    return o1 === o2;
  };

  const [isValid, setIsValid] = useState(error ? false : true);
  const [isTouched, setIsTouched] = useState(false);

  const checkValidity = (event?: IonSelectCustomEvent<SelectChangeEventDetail<ValueType>>) => {
    let validity = false;
    if (event) {
      validity = Array.isArray(event.detail.value) ? event.detail.value.length > 0 : !!event.detail.value;
    } else {
      validity = Array.isArray(selected) ? selected.length > 0 : !!selected;
    }
    setIsValid(required ? validity && !error : true);
    setIsTouched(true);
  };
  const handleChange = (event: IonSelectCustomEvent<SelectChangeEventDetail<ValueType>>) => {
    if (isTouched) checkValidity(event);
    setSelected(event.detail.value, actionType);
  };

  const getHelperText = () => {
    if (helperText) return helperText;
    if (Array.isArray(selected) || multiple) return t('multiple-values-supported');
    return '';
  };

  const getErrorText = () => {
    if (error) return error;
    if (!isValid) return t('required-field');
    return '';
  };

  useEffect(() => {
    if (isTouched) {
      const validity = Array.isArray(selected) ? selected.length > 0 : !!selected;
      setIsValid(required ? validity && !error : true);
    }
  }, [required, error, selected, isTouched]);

  return (
    <div className={'selectWrapper' + (isValid && (!error || error === '') ? '' : ' invalid') + (disabled ? ' disabled' : '')}>
      {!hideLabel && (
        <IonLabel className={'formLabel' + (disabled ? ' disabled' : '')} onClick={() => focusInput()}>
          {label} {required ? '*' : ''}
        </IonLabel>
      )}
      {isLoading && <IonSkeletonText animated={true} className="select-skeleton" />}
      {!isLoading && (
        <>
          <IonItem className="selectInput">
            <IonSelect
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
              {sortedOptions?.map((item) => {
                const optionLabel = (item.name && (item.name[lang] || item.name.fi)) || item.id;
                const coordinates = (item as PilotPlace).geometry?.coordinates;
                const additionalLabel = coordinates ? [coordinates[1], coordinates[0]].join(', ') : '';
                return (
                  <IonSelectOption key={item.id.toString()} value={compareObjects ? item : item.id}>
                    {showId ? '[' + item.id + '] ' : ''}
                    {optionLabel + (additionalLabel ? ' [' + additionalLabel + ']' : '')}
                  </IonSelectOption>
                );
              })}
            </IonSelect>
          </IonItem>
          {isValid && (!error || error === '') && getHelperText() && <IonNote className="helper">{getHelperText()}</IonNote>}
          <IonNote className="input-error">{getCombinedErrorAndHelperText(getHelperText(), getErrorText())}</IonNote>
        </>
      )}
    </div>
  );
};

export default FormSelect;
