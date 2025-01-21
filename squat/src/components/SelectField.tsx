import React, { useCallback } from 'react';
import { IonItem, IonNote, IonSelect, IonSelectOption } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { useSquatContext } from '../hooks/squatContext';
import { Action } from '../hooks/squatReducer';
import Label from './Label';
import { IonSelectCustomEvent, SelectChangeEventDetail } from '@ionic/core/dist/types/components';

type OptionType = {
  id: number;
  name: string;
};

interface SelectProps {
  title: string;
  name: string;
  value: unknown;
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

  const handleChange = useCallback(
    (e: IonSelectCustomEvent<SelectChangeEventDetail>) => {
      dispatch({
        type: props.actionType,
        payload: {
          key: e.target.name,
          value: e.target.value,
          elType: e.target.tagName,
        },
      });
    },
    [dispatch, props.actionType]
  );

  return (
    <>
      <Label
        id={`${props.actionType}-label`}
        title={props.title}
        required={props.required}
        infoContentTitle={props.infoContentTitle}
        infoContent={props.infoContent}
      />

      <IonItem className={props.fieldClass}>
        <IonSelect value={props.value} name={props.name} onIonChange={handleChange} className="full-width" fill="outline">
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
