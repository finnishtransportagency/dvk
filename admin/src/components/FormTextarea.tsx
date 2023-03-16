import React, { useEffect, useRef, useState } from 'react';
import { IonItem, IonLabel, IonNote, IonTextarea } from '@ionic/react';
import { ActionType, Lang } from '../utils/constants';
import { useTranslation } from 'react-i18next';
import { ReactComponent as ErrorIcon } from '../theme/img/error_icon.svg';
import { IonTextareaCustomEvent, TextareaChangeEventDetail } from '@ionic/core';

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

  const inputRef = useRef<HTMLIonTextareaElement>(null);
  const focusInput = () => {
    inputRef.current?.setFocus();
  };

  const [isValid, setIsValid] = useState(error ? false : true);

  const checkValidity = (event: IonTextareaCustomEvent<TextareaChangeEventDetail> | IonTextareaCustomEvent<FocusEvent>) => {
    setIsValid(error ? false : (event.target.querySelector('textarea') as HTMLTextAreaElement)?.checkValidity());
  };
  const handleChange = (event: IonTextareaCustomEvent<TextareaChangeEventDetail>) => {
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
        <IonTextarea
          ref={inputRef}
          value={val}
          required={required}
          onIonChange={(ev) => handleChange(ev)}
          onIonBlur={(ev) => checkValidity(ev)}
          disabled={disabled}
          autoGrow
          rows={1}
          className="ion-align-self-center"
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
