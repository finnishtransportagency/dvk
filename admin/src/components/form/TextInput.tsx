import React, { useEffect, useRef, useState } from 'react';
import { IonButton, IonInput, IonLabel, IonText } from '@ionic/react';
import { ActionType, Lang, INPUT_MAXLENGTH } from '../../utils/constants';
import { useTranslation } from 'react-i18next';
import { checkInputValidity, getCombinedErrorAndHelperText, getInputCounterText, isInputOk } from '../../utils/common';
import HelpIcon from '../../theme/img/help_icon.svg?react';
import NotificationModal from '../NotificationModal';

interface TextInputProps {
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
  setValidity?: (actionType: ActionType, val: boolean) => void;
  maxCharLength?: number;
  infoTitle?: string;
  infoDescription?: string;
}

const TextInput: React.FC<TextInputProps> = ({
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
  setValidity,
  maxCharLength,
  infoTitle,
  infoDescription,
}) => {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'general' });
  const inputRef = useRef<HTMLIonInputElement>(null);

  const [isValid, setIsValid] = useState(!error);
  const [isTouched, setIsTouched] = useState(false);
  const [infoModalOpen, setInfoModalOpen] = useState<boolean>(false);

  const focusInput = () => {
    inputRef.current?.setFocus().catch((err) => {
      console.error(err.message);
    });
  };

  const handleChange = (newVal: string | number | null | undefined) => {
    if (isTouched) {
      checkInputValidity(inputRef, setIsValid, actionType, setValidity, error);
    }
    if (!newVal) {
      newVal = '';
    }
    setValue(newVal as string, actionType, actionLang, actionTarget, actionOuterTarget);
  };

  const getErrorText = () => {
    if (error) return error;
    if (!isValid && required && (val ?? '').toString().trim().length < 1) return t('required-field');
    if (!isValid) return t('check-input');
    return '';
  };

  const getNumberInputHelperText = () => {
    const minVal = Number(min ?? 0).toLocaleString(i18n.language, {
      minimumFractionDigits: decimalCount ?? 0,
      maximumFractionDigits: decimalCount ?? 0,
    });
    const maxVal = Number(max).toLocaleString(i18n.language, {
      minimumFractionDigits: decimalCount ?? 0,
      maximumFractionDigits: decimalCount ?? 0,
    });
    return t('allowed-values') + ': ' + minVal + ' - ' + maxVal + (unit ? ' ' + t('unit.' + unit) : '');
  };

  const getHelperText = () => {
    if (helperText) return helperText;
    switch (inputType) {
      case 'latitude':
        return t('coordinate-format') + ': 58.00000 - 69.99999';
      case 'longitude':
        return t('coordinate-format') + ': 17.00000 - 31.99999';
      case 'number':
        return max ? getNumberInputHelperText() : '';
      default:
        return '';
    }
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
    switch (inputType) {
      case 'latitude':
        return '(5[89]|6\\d){1}(\\.\\d{1,5})?'; // lat range 58-70
      case 'longitude':
        return '(1[789]|2\\d|3[01]){1}(\\.\\d{1,5})?'; // lon range 17-32
      case 'tel':
        return multiple ? '(^$)|(([+]?\\d(\\s?\\d){4,19}){1}(,[+]?\\d(\\s?\\d){4,19}){0,9})' : '[+]?\\d(\\s?\\d){4,19}';
      default:
        return undefined;
    }
  };

  const getStep = () => {
    return (1 / Math.pow(10, decimalCount ?? 0)).toString() || '0.1';
  };

  const showInfoModal = () => {
    setInfoModalOpen(true);
  };

  useEffect(() => {
    if (isTouched) {
      checkInputValidity(inputRef, setIsValid, actionType, setValidity, error);
      setIsTouched(false);
    } else if (!required && !val && !error) {
      setIsValid(true);
      if (setValidity) setValidity(actionType, true);
    }
  }, [required, error, isTouched, val, setValidity, actionType]);

  useEffect(() => {
    if (focused) {
      setTimeout(() => {
        focusInput();
      }, 150);
    }
  }, [focused]);

  return (
    <>
      <IonLabel className={'formLabel' + (disabled ? ' disabled' : '')}>
        <IonText onClick={() => focusInput()}>
          {label} {required ? '*' : ''}
        </IonText>
        {infoTitle && infoDescription && (
          <IonButton
            fill="clear"
            className="icon-only xx-small labelButton"
            onClick={() => showInfoModal()}
            title={t('info') ?? ''}
            aria-label={t('info') ?? ''}
          >
            <HelpIcon />
          </IonButton>
        )}
      </IonLabel>
      <IonInput
        ref={inputRef}
        className={'formInput' + (isInputOk(isValid, error) ? '' : ' invalid')}
        counter={true}
        counterFormatter={(inputLength, maxLength) => getInputCounterText(inputLength, maxLength)}
        debounce={500}
        disabled={disabled}
        errorText={getCombinedErrorAndHelperText(getHelperText(), getErrorText())}
        fill="outline"
        helperText={isInputOk(isValid, error) ? getHelperText() : ''}
        inputMode={getInputMode()}
        label={unit ? t('unit.' + unit) ?? '' : ''}
        labelPlacement={unit ? 'end' : undefined}
        max={inputType === 'number' ? max ?? 9999999 : undefined}
        maxlength={maxCharLength ?? INPUT_MAXLENGTH}
        min={inputType === 'number' ? min ?? 0 : undefined}
        multiple={inputType === 'email' && multiple}
        name={name ? name + (actionLang ?? '') : undefined}
        onIonBlur={() => {
          checkInputValidity(inputRef, setIsValid, actionType, setValidity, error);
          setIsTouched(true);
        }}
        onIonChange={(ev) => handleChange(ev.target.value)}
        onIonInput={(ev) => handleChange(ev.target.value)}
        pattern={getInputPattern()}
        required={required}
        step={inputType === 'number' ? getStep() : undefined}
        type={getInputType()}
        value={val}
      />
      <NotificationModal
        isOpen={infoModalOpen}
        closeAction={() => setInfoModalOpen(false)}
        closeTitle={t('close')}
        header={infoTitle ?? ''}
        message={infoDescription ?? ''}
      />
    </>
  );
};

export default TextInput;
