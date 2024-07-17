import React, { useCallback, useEffect, useRef, useState } from 'react';
import { IonLabel, IonTextarea } from '@ionic/react';
import { ActionType, Lang, TEXTAREA_MAXLENGTH } from '../../utils/constants';
import { useTranslation } from 'react-i18next';
import { getCombinedErrorAndHelperText, getInputCounterText, isInputOk } from '../../utils/common';

interface TextareaProps {
  label: string;
  val: string;
  setValue: (val: string, actionType: ActionType, actionLang?: Lang, actionTarget?: string | number) => void;
  actionType: ActionType;
  actionLang?: Lang;
  actionTarget?: string | number;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string | null;
  name?: string;
}

const Textarea: React.FC<TextareaProps> = ({
  label,
  val,
  setValue,
  actionType,
  actionLang,
  required,
  disabled,
  error,
  helperText,
  name,
  actionTarget,
}) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'general' });

  const inputRef = useRef<HTMLIonTextareaElement>(null);

  const [isValid, setIsValid] = useState(!error);
  const [isTouched, setIsTouched] = useState(false);

  const focusInput = () => {
    inputRef.current?.setFocus().catch((err) => {
      console.error(err.message);
    });
  };

  const checkValidity = useCallback(() => {
    if (!error) {
      inputRef.current
        ?.getInputElement()
        .then((textarea) => (textarea ? setIsValid(textarea.checkValidity()) : null))
        .catch((err) => {
          console.error(err.message);
        });
    }
  }, [error]);

  const handleChange = (newVal: string | null | undefined) => {
    if (isTouched) checkValidity();
    setValue(newVal as string, actionType, actionLang, actionTarget);
  };

  const getErrorText = () => {
    if (error) return error;
    if (!isValid) return t('required-field');
    return '';
  };

  useEffect(() => {
    if (isTouched) {
      checkValidity();
      setIsTouched(false);
    } else if (error) {
      setIsValid(false);
    } else if (!required && !val.trim() && !error) {
      setIsValid(true);
    }
  }, [required, error, isTouched, val, checkValidity]);

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
        debounce={500}
        onIonChange={(ev) => handleChange(ev.target.value)}
        onIonBlur={() => {
          checkValidity();
          setIsTouched(true);
        }}
        disabled={disabled}
        autoGrow
        rows={1}
        maxlength={TEXTAREA_MAXLENGTH}
        fill="outline"
        className={'ion-align-self-center formInput' + (isInputOk(isValid, error) ? '' : ' invalid')}
        helperText={isInputOk(isValid, error) ? (helperText ?? '') : ''}
        errorText={getCombinedErrorAndHelperText(helperText, getErrorText())}
        labelPlacement="fixed"
        counter={true}
        counterFormatter={(inputLength, maxLength) => getInputCounterText(inputLength, maxLength)}
      />
    </>
  );
};

export default Textarea;
