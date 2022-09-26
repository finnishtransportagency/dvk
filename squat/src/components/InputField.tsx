import React, { ReactElement, useEffect, useState } from 'react';
import { IonIcon, IonInput, IonItem, IonLabel, IonNote } from '@ionic/react';
import { alertCircleOutline } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import { useSquatContext } from '../hooks/squatContext';
import { Action } from '../hooks/squatReducer';
import Label from './Label';
import i18n from '../i18n';
import { countDecimals } from '../utils/helpers';

interface InputProps {
  title: string;
  name: string;
  value: number | string | null;
  required?: boolean;
  placeholder: string;
  min?: number;
  max?: number;
  step?: string;
  unit?: string | ReactElement;
  unitId?: string;
  helper?: string | ReactElement;
  fieldClass?: string;
  actionType: Action['type'];
  infoContentTitle?: string;
  infoContent?: string;
}

const InputField: React.FC<InputProps> = (props) => {
  const { t } = useTranslation();
  const { dispatch } = useSquatContext();
  const [value, setValue] = useState<string | number | null>(props.value);

  useEffect(() => {
    setValue(props.value);
  }, [props.value]);

  const innerUpdateAction = (event: CustomEvent, actionType: Action['type']) => {
    setValue((event.target as HTMLInputElement).value);
    dispatch({
      type: 'validation',
      payload: {
        key: (event.target as HTMLInputElement).name,
        value: ((event.target as HTMLInputElement).firstChild as HTMLInputElement).checkValidity(),
        elType: 'boolean',
      },
    });
    dispatch({
      type: actionType,
      payload: {
        key: (event.target as HTMLInputElement).name,
        value: (event.target as HTMLInputElement).value,
        elType: (event.target as HTMLInputElement).tagName,
        fallThrough: true,
      },
    });
  };

  const updateAction = (event: CustomEvent, actionType: Action['type']) => {
    dispatch({
      type: actionType,
      payload: {
        key: (event.target as HTMLInputElement).name,
        value: (event.target as HTMLInputElement).value,
        elType: (event.target as HTMLInputElement).tagName,
      },
    });
  };

  const getHelperText = () => {
    let helper;
    if (props.min !== undefined)
      helper = (
        <>
          <span aria-label={t('common.minimum-value')} role="definition">
            {Number(props.min).toLocaleString(i18n.language, {
              minimumFractionDigits: countDecimals(Number(props.step)),
              maximumFractionDigits: countDecimals(Number(props.step)),
            })}
          </span>
          {' – '}
        </>
      );
    if (props.max !== undefined)
      helper = (
        <>
          {helper}
          <span aria-label={t('common.maximum-value')} role="definition">
            {Number(props.max).toLocaleString(i18n.language, {
              minimumFractionDigits: countDecimals(Number(props.step)),
              maximumFractionDigits: countDecimals(Number(props.step)),
            })}
          </span>
        </>
      );
    if (props.unit)
      helper = (
        <>
          {helper}
          <span
            aria-label={t('common.unit.' + (props.unitId ? props.unitId : props.unit), {
              count: Number((value || 0).toLocaleString(i18n.language)),
            })}
            role="definition"
          >
            &nbsp;{props.unit}
          </span>
        </>
      );
    return helper;
  };
  const getErrorText = () => {
    if (value) {
      if (props.min !== undefined && value < props.min) {
        const unit = (
          <span aria-label={t('common.unit.' + (props.unitId ? props.unitId : props.unit), { count: props.min })} role="definition">
            {props.unit}
          </span>
        );
        return (
          <span>
            {t('common.value-cannot-be-less-than', { value: props.min.toLocaleString(i18n.language) })}&nbsp;{unit}
          </span>
        );
      } else if (props.max !== undefined && value > props.max) {
        const unit = (
          <span aria-label={t('common.unit.' + (props.unitId ? props.unitId : props.unit), { count: props.max })} role="definition">
            {props.unit}
          </span>
        );
        return (
          <span>
            {t('common.value-cannot-be-over', { value: props.max.toLocaleString(i18n.language) })}&nbsp;{unit}
          </span>
        );
      } else if (countDecimals(Number(value)) > countDecimals(Number(props.step))) {
        return t('common.maximum-precision-is-X-decimals', { count: countDecimals(Number(props.step)) });
      } else {
        return t('common.value-invalid');
      }
    }
    return t('common.required');
  };

  return (
    <>
      <Label title={props.title} required={props.required} infoContentTitle={props.infoContentTitle} infoContent={props.infoContent} />

      <IonItem fill="outline" className={props.fieldClass + ' input-item'}>
        <IonInput
          type="number"
          min={props.min}
          max={props.max}
          step={props.step}
          name={props.name}
          required={props.required}
          value={value}
          placeholder={props.placeholder}
          onIonChange={(e) => innerUpdateAction(e, props.actionType)}
          onIonBlur={(e) => updateAction(e, props.actionType)}
          debounce={250}
          inputmode="decimal"
        />
        {props.unit && (
          <IonLabel slot="end" color="medium" className="unit">
            <span
              aria-label={t('common.unit.' + (props.unitId ? props.unitId : props.unit), {
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
          <IonIcon icon={alertCircleOutline} color="danger" aria-label={t('common.error')} />
          {getErrorText()}
        </IonNote>
      </IonItem>
    </>
  );
};

export default InputField;
