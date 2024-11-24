import React, { useEffect, useRef, useState } from 'react';
import { IonLabel, IonNote, IonSelect, IonSelectOption, IonSkeletonText } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { ActionType, Lang, SelectOption, ValueType } from '../../utils/constants';
import { PilotPlace } from '../../graphql/generated';
import { IonSelectCustomEvent } from '@ionic/core/dist/types/components';
import { getCombinedErrorAndHelperText, getSelectedItemsAsText, isInputOk, sortSelectOptions } from '../../utils/common';
import { roundCoordinates } from '../../utils/coordinateUtils';
import TextInput from './TextInput';
import Textarea from './Textarea';

interface SelectChangeEventDetail<ValueType> {
  value: ValueType;
}

interface SelectInputProps {
  label: string;
  selected?: ValueType;
  options: SelectOption[] | PilotPlace[] | null;
  setSelected: (value: ValueType, actionType: ActionType) => void;
  actionType: ActionType;
  required?: boolean;
  multiple?: boolean;
  showId?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  helperText?: string | null;
  hideLabel?: boolean;
  error?: string;
  compareObjects?: boolean;
  isLoading?: boolean;
  showCoords?: boolean;
}

const SelectInput: React.FC<SelectInputProps> = ({
  label,
  selected,
  options,
  setSelected,
  actionType,
  required,
  multiple,
  showId,
  disabled,
  readonly = false,
  helperText,
  hideLabel,
  error,
  compareObjects,
  isLoading,
  showCoords,
}) => {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'general' });
  const lang = i18n.resolvedLanguage as Lang;
  const sortedOptions = options ? sortSelectOptions(options, lang) : [];

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

  const [isValid, setIsValid] = useState(!error);
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

  //For readability of tsx
  const readonlyAndLoading = readonly && !isLoading;
  const inputOrLoading = !readonlyAndLoading;

  const stringValue = '' + getSelectedItemsAsText(options, selected, lang, ', ');
  return (
    <>
      {readonlyAndLoading &&
        (multiple ? (
          <Textarea readonly={readonly} label={label} setValue={() => {}} actionType="empty" val={stringValue} required={required} />
        ) : (
          <TextInput readonly={readonly} label={label} setValue={() => {}} actionType="empty" val={stringValue} required={required} />
        ))}
      {inputOrLoading && (
        <div className={'selectWrapper' + (isInputOk(isValid, error) ? '' : ' invalid') + (disabled ? ' disabled' : '')}>
          {!hideLabel && (
            <IonLabel className={'formLabel' + (disabled ? ' disabled' : '')} onClick={() => focusInput()}>
              {label} {required ? '*' : ''}
            </IonLabel>
          )}
          {isLoading ? (
            <IonSkeletonText animated={true} className="select-skeleton" />
          ) : (
            <>
              <IonSelect
                ref={selectRef}
                className="selectInput"
                placeholder={t('choose') ?? ''}
                onIonChange={(ev) => handleChange(ev)}
                onIonBlur={() => checkValidity()}
                interface="popover"
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
                  const coordinates = showCoords ? roundCoordinates(item.geometry?.coordinates, 5) : undefined;
                  const additionalLabel = coordinates ? [coordinates[1], coordinates[0]].join(', ') : '';
                  return (
                    <IonSelectOption key={item.id.toString()} value={compareObjects ? item : item.id}>
                      {showId ? '[' + item.id + '] ' : ''}
                      {optionLabel + (additionalLabel ? ' [' + additionalLabel + ']' : '')}
                    </IonSelectOption>
                  );
                })}
              </IonSelect>
              {isInputOk(isValid, error) && getHelperText() && <IonNote className="helper">{getHelperText()}</IonNote>}
              <IonNote className="input-error">{getCombinedErrorAndHelperText(getHelperText(), getErrorText())}</IonNote>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default SelectInput;
