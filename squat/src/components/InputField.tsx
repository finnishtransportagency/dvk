import React, { useCallback, useEffect, useRef, useState } from 'react';
import { IonInput } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { useSquatContext } from '../hooks/squatContext';
import { Action } from '../hooks/squatReducer';
import Label from './Label';
import i18n from '../i18n';
import { countDecimals } from '../utils/helpers';
import { InputChangeEventDetail, IonInputCustomEvent } from '@ionic/core/dist/types/components';

interface InputProps {
  title: string;
  description?: string;
  name: string;
  value: number | string | null;
  required?: boolean;
  placeholder: string;
  min?: number;
  max?: number;
  step?: string;
  unit?: string;
  fieldClass?: string;
  actionType: Action['type'];
  infoContentTitle?: string;
  infoContent?: string;
  inputType?: 'text' | 'number';
  inputMode?: 'text' | 'decimal' | 'numeric';
}

const InputField: React.FC<InputProps> = (props) => {
  const { t } = useTranslation('', { keyPrefix: 'common' });
  const { dispatch } = useSquatContext();
  const [value, setValue] = useState<string | number | null>(props.value);
  const inputRef = useRef<HTMLIonInputElement>(null);

  useEffect(() => {
    setValue(props.value);
    if (props.value !== null) {
      inputRef?.current?.classList.add('ion-touched');
      /* Set timeout to make sure ionic has rendered/modified native input element before validating */
      setTimeout(() => {
        inputRef?.current?.getInputElement().then((inputElem) => {
          if (inputElem) {
            dispatch({
              type: 'validation',
              payload: {
                key: inputElem.name,
                value: inputElem.checkValidity(),
                elType: 'boolean',
              },
            });
          }
        });
      }, 100);
    }
  }, [props.value, props.min, props.max, dispatch]);

  const innerUpdateAction = useCallback(
    (event: CustomEvent, actionType: Action['type']) => {
      inputRef?.current?.getInputElement().then((inputElem) => {
        let val = inputElem.value;
        let isValid = inputElem.checkValidity();
        if (inputElem.type === 'text') {
          // Number stored in a text field - must validate type, min, max and step
          val = val.replace(/,/g, '.');
          const isNumber = !!val && !isNaN(Number(val)) && !isNaN(parseFloat(val));
          isValid =
            isNumber &&
            Number(val) >= Number(props.min) &&
            Number(val) <= Number(props.max) &&
            countDecimals(Number(val)) <= countDecimals(Number(props.step));
        }
        //checks if zeros preceding other numbers and same thing if there's - symbol preceding
        const trimmedValue = val.replace(/(^0+(?=\d))|((?<=-)0+(?=\d))/g, '');
        setValue(trimmedValue);
        dispatch({
          type: 'validation',
          payload: {
            key: inputElem.name,
            value: isValid,
            elType: 'boolean',
          },
        });
        dispatch({
          type: actionType,
          payload: {
            key: inputElem.name,
            value: trimmedValue,
            elType: inputElem.tagName,
            fallThrough: true,
          },
        });
      });
    },
    [dispatch, props.min, props.max, props.step]
  );

  const updateAction = useCallback(
    (event: CustomEvent, actionType: Action['type']) => {
      inputRef?.current?.classList.add('ion-touched');
      dispatch({
        type: actionType,
        payload: {
          key: (event.target as HTMLInputElement).name,
          value: (event.target as HTMLInputElement).value,
          elType: (event.target as HTMLInputElement).tagName,
        },
      });
    },
    [dispatch]
  );

  const getHelperText = () => {
    let helper = '';
    if (props.min !== undefined)
      helper =
        Number(props.min).toLocaleString(i18n.language, {
          minimumFractionDigits: countDecimals(Number(props.step)),
          maximumFractionDigits: countDecimals(Number(props.step)),
        }) + ' - ';
    if (props.max !== undefined)
      helper += Number(props.max).toLocaleString(i18n.language, {
        minimumFractionDigits: countDecimals(Number(props.step)),
        maximumFractionDigits: countDecimals(Number(props.step)),
      });
    if (props.unit) helper += props.unit === '°' ? props.unit : ' ' + props.unit;
    return helper;
  };

  const getErrorText = () => {
    const errorSign = '\u26A0 ';
    if (value) {
      const unit = props.unit ?? '';
      if (props.min !== undefined && Number(value) < props.min) {
        return errorSign + t('value-cannot-be-less-than', { value: props.min.toLocaleString(i18n.language) }) + ' ' + unit;
      } else if (props.max !== undefined && Number(value) > props.max) {
        return errorSign + t('value-cannot-be-over', { value: props.max.toLocaleString(i18n.language) }) + ' ' + unit;
      } else if (countDecimals(Number(value)) > countDecimals(Number(props.step))) {
        return errorSign + t('maximum-precision-is-X-decimals', { count: countDecimals(Number(props.step)) });
      } else {
        return errorSign + t('value-invalid');
      }
    }
    return errorSign + t('required');
  };

  const handleChange = useCallback(
    (e: IonInputCustomEvent<InputChangeEventDetail>) => {
      innerUpdateAction(e, props.actionType);
    },
    [innerUpdateAction, props.actionType]
  );

  const handleBlur = useCallback(
    (e: IonInputCustomEvent<FocusEvent>) => {
      updateAction(e, props.actionType);
    },
    [updateAction, props.actionType]
  );

  const handleFocus = () => {
    inputRef?.current?.classList.add('ion-touched');
  };

  console.log('');

  return (
    <>
      <Label
        id={`${props.name}-label`}
        title={props.title}
        description={props.description}
        required={props.required}
        infoContentTitle={props.infoContentTitle}
        infoContent={props.infoContent}
      />

      <IonInput
        ref={inputRef}
        fill="outline"
        className={props.fieldClass + ' input-item'}
        type={props.inputType ?? 'number'}
        min={props.min}
        max={props.max}
        step={props.step}
        name={props.name}
        required={props.required}
        value={value}
        placeholder={props.placeholder}
        onIonChange={handleChange}
        onIonInput={handleChange}
        onIonBlur={handleBlur}
        onIonFocus={handleFocus}
        debounce={250}
        inputmode={props.inputMode ?? 'decimal'}
        label={props.unit}
        labelPlacement="end"
        helperText={getHelperText()}
        errorText={getErrorText()}
        data-testid={props.name}
        aria-labelledby={`${props.name}-label`}
      />
    </>
  );
};

export default InputField;
