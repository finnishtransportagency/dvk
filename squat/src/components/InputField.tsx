import React, { ReactElement } from 'react';
import { IonIcon, IonInput, IonItem, IonLabel, IonNote } from '@ionic/react';
import { alertCircleOutline } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import { useSquatContext } from '../hooks/squatContext';
import { Action } from '../hooks/squatReducer';

interface InputProps {
  title: string;
  name: string;
  value: number | string | null;
  required?: boolean;
  placeholder: string;
  min?: string;
  max?: string;
  step?: string;
  unit?: string | ReactElement;
  helper?: string;
  fieldClass?: string;
  actionType: Action['type'];
}

const InputField: React.FC<InputProps> = (props) => {
  const { t } = useTranslation();
  const { dispatch } = useSquatContext();

  const updateAction = (event: CustomEvent, actionType: Action['type']) => {
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
      },
    });
  };

  return (
    <>
      <IonItem lines="none" className="only-label">
        <IonLabel color="dark">{props.title}</IonLabel>
      </IonItem>
      {props.required && (
        <IonItem lines="none" className="required-label">
          <IonLabel color="dark">*</IonLabel>
        </IonItem>
      )}
      <IonItem fill="outline" className={props.fieldClass}>
        <IonInput
          type="number"
          min={props.min}
          max={props.max}
          step={props.step}
          name={props.name}
          required={props.required}
          value={props.value}
          placeholder={props.placeholder}
          onIonChange={(e) => updateAction(e, props.actionType)}
          debounce={50}
          inputmode="numeric"
        />
        {props.unit && (
          <IonLabel slot="end" color="medium">
            {props.unit}
          </IonLabel>
        )}
        {props.helper && <IonNote slot="helper">{props.helper}</IonNote>}
        <IonNote slot="error" className="input-error">
          <IonIcon icon={alertCircleOutline} color="danger" />
          {props.value ? t('common.value-out-of-range') : t('common.required')}
        </IonNote>
      </IonItem>
    </>
  );
};

export default InputField;
