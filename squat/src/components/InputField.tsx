import React, { ReactElement, useCallback, useEffect, useRef, useState } from 'react';
import { IonIcon, IonInput, IonItem, IonLabel, IonNote } from '@ionic/react';
import { warningOutline } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import { useSquatContext } from '../hooks/squatContext';
import { Action } from '../hooks/squatReducer';
import Label from './Label';
import i18n from '../i18n';
import { countDecimals } from '../utils/helpers';
import { InputChangeEventDetail, IonInputCustomEvent } from '@ionic/core';

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
  unitId?: string;
  helper?: string | ReactElement;
  fieldClass?: string;
  actionType: Action['type'];
  infoContentTitle?: string;
  infoContent?: string;
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
      inputRef?.current?.getInputElement().then((inputElem) => {
        setValue(inputElem.value);
        dispatch({
          type: 'validation',
          payload: {
            key: inputElem.name,
            value: inputElem.checkValidity(),
            elType: 'boolean',
          },
        });
      });
    }
  }, [props.value, dispatch]);

  const innerUpdateAction = useCallback(
    (event: CustomEvent, actionType: Action['type']) => {
      inputRef?.current?.getInputElement().then((inputElem) => {
        setValue(inputElem.value);
        dispatch({
          type: 'validation',
          payload: {
            key: inputElem.name,
            value: inputElem.checkValidity(),
            elType: 'boolean',
          },
        });
        dispatch({
          type: actionType,
          payload: {
            key: inputElem.name,
            value: inputElem.value,
            elType: inputElem.tagName,
            fallThrough: true,
          },
        });
      });
    },
    [dispatch]
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
    /*
      helper = (
        <>
          <span aria-label={t('minimum-value')} role="definition">
            {Number(props.min).toLocaleString(i18n.language, {
              minimumFractionDigits: countDecimals(Number(props.step)),
              maximumFractionDigits: countDecimals(Number(props.step)),
            })}
          </span>
          {' – '}
        </>
      );
      */
    if (props.max !== undefined)
      helper += Number(props.max).toLocaleString(i18n.language, {
        minimumFractionDigits: countDecimals(Number(props.step)),
        maximumFractionDigits: countDecimals(Number(props.step)),
      });
    /*
      helper = (
        <>
          {helper}
          <span aria-label={t('maximum-value')} role="definition">
            {Number(props.max).toLocaleString(i18n.language, {
              minimumFractionDigits: countDecimals(Number(props.step)),
              maximumFractionDigits: countDecimals(Number(props.step)),
            })}
          </span>
        </>
      );
      */
    if (props.unit) helper += ' ' + props.unit;
    /*
      helper = (
        <>
          {helper}
          <span
            aria-label={t('unit.' + (props.unitId ? props.unitId : props.unit), {
              count: Number((value || 0).toLocaleString(i18n.language)),
            })}
            role="definition"
          >
            &nbsp;{props.unit}
          </span>
        </>
      );
    */
    return helper;
  };

  const getErrorText = () => {
    const errorSign = '\u26A0 ';
    if (value) {
      const unit = props.unit || '';
      if (props.min !== undefined && Number(value) < props.min) {
        return errorSign + t('value-cannot-be-less-than', { value: props.min.toLocaleString(i18n.language) }) + ' ' + unit;
        /*
        const unit = (
          <span aria-label={t('unit.' + (props.unitId ? props.unitId : props.unit), { count: props.min })} role="definition">
            {props.unit}
          </span>
        );
        return (
          <span>
            {t('value-cannot-be-less-than', { value: props.min.toLocaleString(i18n.language) })}&nbsp;{unit}
          </span>
        );
        */
      } else if (props.max !== undefined && Number(value) > props.max) {
        return errorSign + t('value-cannot-be-over', { value: props.max.toLocaleString(i18n.language) }) + ' ' + unit;
        /*
        const unit = (
          <span aria-label={t('unit.' + (props.unitId ? props.unitId : props.unit), { count: props.max })} role="definition">
            {props.unit}
          </span>
        );
        return (
          <span>
            {t('value-cannot-be-over', { value: props.max.toLocaleString(i18n.language) })}&nbsp;{unit}
          </span>
        );
        */
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

  return (
    <>
      <Label
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
        type="number"
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
        inputmode="decimal"
        mode="md"
        label={props.unit}
        labelPlacement="end"
        helperText={getHelperText()}
        errorText={getErrorText()}
      />
    </>
  );
  /*
  return (
    <>
      <Label
        title={props.title}
        description={props.description}
        required={props.required}
        infoContentTitle={props.infoContentTitle}
        infoContent={props.infoContent}
      />

      <IonInput
        fill="outline"
        className={props.fieldClass + ' input-item'}
        type="number"
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
        debounce={250}
        inputmode="decimal"
        mode="md"
        label="X"
        labelPlacement="end"
      />
      {!props.unit && (
        <IonLabel slot="end" color="medium" className="unit">
          <span
            aria-label={t('unit.' + (props.unitId ? props.unitId : props.unit), {
              count: Number((value || 0).toLocaleString(i18n.language)),
            })}
            role="definition"
          ></span>
        </IonLabel>
      )}
      {props.unit && (
        <IonLabel slot="end" color="medium" className="unit">
          <span
            aria-label={t('unit.' + (props.unitId ? props.unitId : props.unit), {
              count: Number((value || 0).toLocaleString(i18n.language)),
            })}
            role="definition"
          >
            {props.unit}
          </span>
        </IonLabel>
      )}
      <IonNote slot="helper" className="input-helper">
        {props.helper ? props.helper : getHelperText()}
      </IonNote>
      <IonNote slot="error" className="input-error">
        <div title={t('error')}>
          <IonIcon icon={warningOutline} color="danger" aria-label={t('error')} />
        </div>
        {getErrorText()}
      </IonNote>
    </>
  );
  */
};

export default InputField;
