import React, { useEffect, useRef, useState } from 'react';
import { IonInput, IonItem, IonLabel, IonNote } from '@ionic/react';
import { ActionType, Lang, INPUT_MAXLENGTH } from '../utils/constants';
import { useTranslation } from 'react-i18next';
import { ReactComponent as ErrorIcon } from '../theme/img/error_icon.svg';
import { InputChangeEventDetail, IonInputCustomEvent } from '@ionic/core';

interface InputProps {
  label: string;
  val: string | number | null | undefined;
  setValue: (val: string, actionType: ActionType, actionLang?: Lang, actionTarget?: string | number, actionOuterTarget?: string | number) => void;
  actionType: ActionType;
  actionLang?: Lang;
  actionTarget?: string | number;
  actionOuterTarget?: string | number;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string | null;
  inputType?: 'text' | 'number' | 'tel' | 'email' | 'latitude' | 'longitude';
  multiple?: boolean;
  unit?: string;
  min?: number;
  max?: number;
  decimalCount?: number;
}

const FormInput: React.FC<InputProps> = ({
  label,
  val,
  setValue,
  actionType,
  actionLang,
  actionTarget,
  actionOuterTarget,
  required,
  disabled,
  error,
  helperText,
  inputType,
  multiple,
  unit,
  min,
  max,
  decimalCount,
}) => {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'general' });

  const inputRef = useRef<HTMLIonInputElement>(null);
  const focusInput = () => {
    inputRef.current?.setFocus();
  };

  const [isValid, setIsValid] = useState(error ? false : true);

  const checkValidity = (event: IonInputCustomEvent<InputChangeEventDetail> | IonInputCustomEvent<FocusEvent>) => {
    setIsValid(error ? false : (event.target.firstChild as HTMLInputElement)?.checkValidity());
  };
  const handleChange = (event: IonInputCustomEvent<InputChangeEventDetail>) => {
    checkValidity(event);
    setValue(event.detail.value as string, actionType, actionLang, actionTarget, actionOuterTarget);
  };

  const getErrorText = () => {
    if (error) return error;
    if (!isValid && required && (val || '').toString().trim().length < 1) return t('required-field');
    if (!isValid) return t('check-input');
    return '';
  };

  const getHelperText = () => {
    if (helperText) return helperText;
    if (inputType === 'latitude') return '58.00000 - 69.99999';
    if (inputType === 'longitude') return '17.00000 - 31.99999';
    if (inputType === 'number' && max) {
      return (
        <>
          <span aria-label={t('general.minimum-value') || ''} role="definition">
            {Number(min || 0).toLocaleString(i18n.language, {
              minimumFractionDigits: decimalCount || 0,
              maximumFractionDigits: decimalCount || 0,
            })}
          </span>{' '}
          -{' '}
          <span aria-label={t('general.maximum-value') || ''} role="definition">
            {Number(max).toLocaleString(i18n.language, {
              minimumFractionDigits: decimalCount || 0,
              maximumFractionDigits: decimalCount || 0,
            })}
          </span>{' '}
          {unit && (
            <span
              aria-label={
                t('unit.' + unit + 'Desc', {
                  count: Number(val),
                }) || ''
              }
              role="definition"
            >
              {t('unit.' + unit)}
            </span>
          )}
        </>
      );
    }
    return '';
  };

  const getInputType = () => {
    if (inputType && (inputType === 'latitude' || inputType === 'longitude')) return 'text';
    if (inputType) return inputType;
    return 'text';
  };

  const getInputMode = () => {
    if (multiple) return 'text';
    if (inputType && inputType === 'number') return 'decimal';
    if (inputType && (inputType === 'latitude' || inputType === 'longitude')) return 'text';
    if (inputType) return inputType;
    return 'text';
  };

  const getInputPattern = () => {
    if (actionType === 'primaryId') return '[a-z]+[0-9]*';
    if (inputType === 'latitude') return '(5[89]|6\\d){1}(.[0-9]{1,5})?'; // lat range 58-70
    if (inputType === 'longitude') return '(1[789]|2\\d|3[01]){1}(.[0-9]{1,5})?'; // lon range 17-32
    if (inputType === 'tel' && multiple) return '(^$)|(([+]?[0-9\\s]{5,20}){1}(,[+]?[0-9\\s]{5,20}){0,9})';
    if (inputType === 'tel') return '[+]?[0-9\\s]{5,20}';
    return undefined;
  };

  useEffect(() => {
    inputRef.current?.getInputElement().then((textinput) => (textinput ? setIsValid(error ? false : textinput.checkValidity()) : null));
  }, [required, error]);

  return (
    <>
      <IonLabel className={'formLabel' + (disabled ? ' disabled' : '')} onClick={() => focusInput()}>
        {label} {required ? '*' : ''}
      </IonLabel>
      <IonItem
        className={'formInput' + (isValid && (!error || error === '') ? '' : ' invalid')}
        lines="none"
        fill="outline"
        counter={true}
        counterFormatter={(inputLength, maxLength) => (inputLength > INPUT_MAXLENGTH / 2 ? `${inputLength} / ${maxLength}` : '')}
      >
        <IonInput
          ref={inputRef}
          value={val}
          min={inputType === 'number' ? min || 0 : undefined}
          max={inputType === 'number' ? max || 9999999 : undefined}
          step={inputType === 'number' ? (1 / (10 * (decimalCount || 0.1))).toString() || '0.1' : undefined}
          required={required}
          onIonChange={(ev) => handleChange(ev)}
          onIonBlur={(ev) => checkValidity(ev)}
          disabled={disabled}
          type={getInputType()}
          inputMode={getInputMode()}
          maxlength={INPUT_MAXLENGTH}
          pattern={getInputPattern()}
          multiple={inputType === 'email' && multiple}
        />
        {unit && (
          <IonLabel slot="end" color="medium" className="unit use-flex">
            <span
              aria-label={
                t('unit.' + unit + 'Desc', {
                  count: Number(val),
                }) || ''
              }
              role="definition"
            >
              {t('unit.' + unit)}
            </span>
          </IonLabel>
        )}
        <IonNote slot="helper">{getHelperText()}</IonNote>
        <IonNote slot="error" className="input-error">
          <ErrorIcon aria-label={t('error') || ''} />
          {getErrorText()}
        </IonNote>
      </IonItem>
    </>
  );
};

export default FormInput;
