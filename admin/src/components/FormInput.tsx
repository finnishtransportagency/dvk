import React, { useEffect, useRef, useState } from 'react';
import { IonInput, IonItem, IonLabel, IonNote } from '@ionic/react';
import { ActionType, Lang } from '../utils/constants';
import { useTranslation } from 'react-i18next';
import { ReactComponent as ErrorIcon } from '../theme/img/error_icon.svg';
import { InputChangeEventDetail, IonInputCustomEvent } from '@ionic/core';

interface InputProps {
  label: string;
  val: string | number | null | undefined;
  setValue: (val: string, actionType: ActionType, actionLang?: Lang, actionTarget?: string | number) => void;
  actionType: ActionType;
  actionLang?: Lang;
  actionTarget?: string | number;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string | null;
  inputType?: 'text' | 'number' | 'tel' | 'email';
  unit?: string;
}

const FormInput: React.FC<InputProps> = ({
  label,
  val,
  setValue,
  actionType,
  actionLang,
  actionTarget,
  required,
  disabled,
  error,
  helperText,
  inputType,
  unit,
}) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'general' });

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
    setValue(event.detail.value as string, actionType, actionLang, actionTarget);
  };

  const getErrorText = () => {
    if (error) return error;
    if (!isValid && required && (val || '').toString().trim().length < 1) return t('required-field');
    if (!isValid) return t('check-input');
    return;
  };

  const getInputMode = () => {
    if (inputType && inputType === 'number') return 'decimal';
    if (inputType) return inputType;
    return 'text';
  };

  useEffect(() => {
    setIsValid(error ? false : true);
  }, [error]);

  useEffect(() => {
    inputRef.current?.getInputElement().then((textinput) => (textinput ? setIsValid(error ? false : textinput.checkValidity()) : null));
  }, [required, error]);

  return (
    <>
      <IonLabel className={'formLabel' + (disabled ? ' disabled' : '')} onClick={() => focusInput()}>
        {label} {required ? '*' : ''}
      </IonLabel>
      <IonItem className={'formInput' + (isValid && (!error || error === '') ? '' : ' invalid')} lines="none" fill="outline">
        <IonInput
          ref={inputRef}
          value={val}
          min={inputType === 'number' ? 0 : undefined}
          step={inputType === 'number' ? '0.1' : undefined}
          required={required}
          onIonChange={(ev) => handleChange(ev)}
          onIonBlur={(ev) => checkValidity(ev)}
          disabled={disabled}
          type={inputType || 'text'}
          inputMode={getInputMode()}
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
        <IonNote slot="helper">{helperText}</IonNote>
        <IonNote slot="error" className="input-error">
          <ErrorIcon aria-label={t('error') || ''} />
          {getErrorText()}
        </IonNote>
      </IonItem>
    </>
  );
};

export default FormInput;
