import React, { useEffect, useRef, useState } from 'react';
import { IonInput, IonItem, IonLabel, IonNote } from '@ionic/react';
import { ActionType, Lang } from '../utils/constants';
import { useTranslation } from 'react-i18next';
import { ReactComponent as ErrorIcon } from '../theme/img/error_icon.svg';
import { InputChangeEventDetail, IonInputCustomEvent } from '@ionic/core';

interface InputProps {
  label: string;
  val: string;
  setValue: (val: string, actionType: ActionType, actionLang?: Lang) => void;
  actionType: ActionType;
  actionLang?: Lang;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string | null;
}

const FormInput: React.FC<InputProps> = ({ label, val, setValue, actionType, actionLang, required, disabled, error, helperText }) => {
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
    setValue(event.detail.value as string, actionType, actionLang);
  };

  const getErrorText = () => {
    if (error) return error;
    if (!isValid) return t('required-field');
    return;
  };

  useEffect(() => {
    setIsValid(error ? false : true);
  }, [error]);

  return (
    <>
      <IonLabel className={'formLabel' + (disabled ? ' disabled' : '')} onClick={() => focusInput()}>
        {label} {required ? '*' : ''}
      </IonLabel>
      <IonItem className={'formInput' + (isValid ? '' : ' invalid')} lines="none" fill="outline">
        <IonInput
          ref={inputRef}
          value={val}
          required={required}
          onIonChange={(ev) => handleChange(ev)}
          onIonBlur={(ev) => checkValidity(ev)}
          disabled={disabled}
        />
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
