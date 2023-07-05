import React, { useEffect, useRef, useState } from 'react';
import { IonInput, IonLabel } from '@ionic/react';
import { ActionType, Lang, INPUT_MAXLENGTH } from '../utils/constants';
import { useTranslation } from 'react-i18next';

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
  focused?: boolean;
  name?: string;
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
  focused,
  name,
}) => {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'general' });

  const inputRef = useRef<HTMLIonInputElement>(null);
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
        .then((textinput) => (textinput ? setIsValid(textinput.checkValidity()) : null))
        .catch((err) => {
          console.error(err.message);
        });
    }
    setIsTouched(true);
  };
  const handleChange = (newVal: string | number | null | undefined) => {
    if (isTouched) checkValidity();
    setValue(newVal as string, actionType, actionLang, actionTarget, actionOuterTarget);
  };

  const getErrorText = () => {
    if (error) return error;
    if (!isValid && required && (val ?? '').toString().trim().length < 1) return t('required-field');
    if (!isValid) return t('check-input');
    return '';
  };

  const getHelperText = () => {
    if (helperText) return helperText;
    if (inputType === 'latitude') return '58.00000 - 69.99999';
    if (inputType === 'longitude') return '17.00000 - 31.99999';
    if (inputType === 'number' && max) {
      return (
        Number(min ?? 0).toLocaleString(i18n.language, {
          minimumFractionDigits: decimalCount ?? 0,
          maximumFractionDigits: decimalCount ?? 0,
        }) +
        ' - ' +
        Number(max).toLocaleString(i18n.language, {
          minimumFractionDigits: decimalCount ?? 0,
          maximumFractionDigits: decimalCount ?? 0,
        }) +
        (unit ? ' ' + t('unit.' + unit) : '')
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
    if (actionType === 'primaryId') return '[a-z]+[a-z\\d]*';
    if (inputType === 'latitude') return '(5[89]|6\\d){1}(\\.\\d{1,5})?'; // lat range 58-70
    if (inputType === 'longitude') return '(1[789]|2\\d|3[01]){1}(\\.\\d{1,5})?'; // lon range 17-32
    if (inputType === 'tel' && multiple) return '(^$)|(([+]?\\d(\\s?\\d){4,19}){1}(,[+]?\\d(\\s?\\d){4,19}){0,9})';
    if (inputType === 'tel') return '[+]?\\d(\\s?\\d){4,19}';
    return undefined;
  };

  useEffect(() => {
    if (isTouched) {
      inputRef.current
        ?.getInputElement()
        .then((textinput) => {
          if (error) setIsValid(false);
          if (textinput) setIsValid(textinput.checkValidity());
        })
        .catch((err) => {
          console.error(err.message);
        });
      setIsTouched(false);
    } else if (!required && !val && !error) {
      setIsValid(true);
    }
  }, [required, error, isTouched, val]);

  useEffect(() => {
    if (focused) {
      setTimeout(() => {
        focusInput();
      }, 150);
    }
  }, [focused]);

  return (
    <>
      <IonLabel className={'formLabel' + (disabled ? ' disabled' : '')} onClick={() => focusInput()}>
        {label} {required ? '*' : ''}
      </IonLabel>
      <IonInput
        ref={inputRef}
        name={name ? name + (actionLang ?? '') : undefined}
        value={val}
        min={inputType === 'number' ? min ?? 0 : undefined}
        max={inputType === 'number' ? max ?? 9999999 : undefined}
        step={inputType === 'number' ? (1 / Math.pow(10, decimalCount ?? 0)).toString() || '0.1' : undefined}
        required={required}
        onIonChange={(ev) => handleChange(ev.target.value)}
        onIonBlur={() => checkValidity()}
        disabled={disabled}
        type={getInputType()}
        inputMode={getInputMode()}
        maxlength={INPUT_MAXLENGTH}
        pattern={getInputPattern()}
        multiple={inputType === 'email' && multiple}
        fill="outline"
        className={'formInput' + (isValid && (!error || error === '') ? '' : ' invalid')}
        helperText={getHelperText()}
        errorText={getErrorText()}
        label={unit ? t('unit.' + unit) ?? '' : ''}
        labelPlacement="end"
        counter={true}
        counterFormatter={(inputLength, maxLength) => (inputLength > INPUT_MAXLENGTH / 2 ? `${inputLength} / ${maxLength}` : '')}
      />
    </>
  );
};

export default FormInput;
