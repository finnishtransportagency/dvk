import React from 'react';
import { IonItem, IonNote, IonSelect, IonSelectOption } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { useSquatContext } from '../hooks/squatContext';
import { Action } from '../hooks/squatReducer';
import Label from './Label';

type OptionType = {
  id: number;
  name: string;
};

interface SelectProps {
  title: string;
  name: string;
  value: unknown | null;
  options: OptionType[];
  required?: boolean;
  helper?: string;
  fieldClass?: string;
  actionType: Action['type'];
  translateOptions?: boolean;
  infoContentTitle?: string;
  infoContent?: string;
}

const SelectField: React.FC<SelectProps> = (props) => {
  const { t } = useTranslation();
  const { dispatch } = useSquatContext();

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

  return (
    <>
      <Label title={props.title} required={props.required} infoContentTitle={props.infoContentTitle} infoContent={props.infoContent} />

      <IonItem fill="outline" className={props.fieldClass}>
        <IonSelect value={props.value} name={props.name} onIonChange={(e) => updateAction(e, props.actionType)} className="full-width">
          {props.options.map((option) => (
            <IonSelectOption key={option.id} value={option}>
              {props.translateOptions ? t(option.name) : option.name}
            </IonSelectOption>
          ))}
        </IonSelect>
        {props.helper && <IonNote slot="helper">{props.helper}</IonNote>}
      </IonItem>
    </>
  );
};

export default SelectField;
