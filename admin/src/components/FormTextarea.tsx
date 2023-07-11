import React, { useEffect, useRef, useState } from 'react';
import { IonLabel, IonTextarea } from '@ionic/react';
import { ActionType, Lang, TEXTAREA_MAXLENGTH } from '../utils/constants';
import { useTranslation } from 'react-i18next';
import { getCombinedErrorAndHelperText } from '../utils/common';

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
  name?: string;
}

const FormInput: React.FC<InputProps> = ({ label, val, setValue, actionType, actionLang, required, disabled, error, helperText, name }) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'general' });

  const inputRef = useRef<HTMLIonTextareaElement>(null);
  const focusInput = () => {
    inputRef.current?.setFocus().catch((err) => {
      console.error(err.message);
    });
  };

  const [isValid, setIsValid] = useState(error ? false : true);
  const [isTouched, setIsTouched] = useState(false);

  const checkValidity = () => {
    if (error) {
      setIsValid(false);
    } else {
      inputRef.current
        ?.getInputElement()
        .then((textarea) => (textarea ? setIsValid(textarea.checkValidity()) : null))
        .catch((err) => {
          console.error(err.message);
        });
    }
    setIsTouched(true);
  };
  const handleChange = (newVal: string | null | undefined) => {
    if (isTouched) checkValidity();
    setValue(newVal as string, actionType, actionLang);
  };

  const getErrorText = () => {
    if (error) return error;
    if (!isValid) return t('required-field');
    return '';
  };

  useEffect(() => {
    if (isTouched) {
      inputRef.current
        ?.getInputElement()
        .then((textarea) => {
          if (error) setIsValid(false);
          if (textarea) setIsValid(textarea.checkValidity());
        })
        .catch((err) => {
          console.error(err.message);
        });
      setIsTouched(false);
    } else if (!required && !val.trim() && !error) {
      setIsValid(true);
    }
  }, [required, error, isTouched, val]);

  return (
    <>
      <IonLabel className={'formLabel' + (disabled ? ' disabled' : '')} onClick={() => focusInput()}>
        {label} {required ? '*' : ''}
      </IonLabel>
      <IonTextarea
        ref={inputRef}
        value={val}
        name={name ? name + (actionLang ?? '') : undefined}
        required={required}
        onIonInput={(ev) => handleChange(ev.target.value)}
        onIonBlur={() => checkValidity()}
        disabled={disabled}
        autoGrow
        rows={1}
        maxlength={TEXTAREA_MAXLENGTH}
        fill="outline"
        className={'ion-align-self-center formInput' + (isValid && (!error || error === '') ? '' : ' invalid')}
        helperText={isValid && (!error || error === '') ? helperText ?? '' : ''}
        errorText={getCombinedErrorAndHelperText(helperText, getErrorText())}
        labelPlacement="fixed"
        counter={true}
        counterFormatter={(inputLength, maxLength) => (inputLength > TEXTAREA_MAXLENGTH / 2 ? `${inputLength} / ${maxLength}` : '')}
      />
    </>
  );
};

export default FormInput;
