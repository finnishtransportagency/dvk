import React, { ReactElement } from 'react';
import { IonCol, IonGrid, IonImg, IonItem, IonLabel, IonRadio, IonRadioGroup, IonRow } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { useSquatContext } from '../hooks/squatContext';
import { Action } from '../hooks/squatReducer';
import Modal from './Modal';

type OptionType = {
  id: number;
  name: string;
  img?: string;
  desc?: string;
};

interface RadioSelectProps {
  title: string;
  name: string;
  value: OptionType | null;
  options: OptionType[];
  required?: boolean;
  actionType: Action['type'];
  translateOptions?: boolean;
  infoContentTitle?: string;
  infoContent?: string | ReactElement;
}

const RadioSelectField: React.FC<RadioSelectProps> = (props) => {
  const { t } = useTranslation();
  const { dispatch } = useSquatContext();

  const updateAction = (event: CustomEvent, actionType: Action['type']) => {
    dispatch({
      type: actionType,
      payload: {
        key: props.name,
        value: (event.target as HTMLInputElement).value,
        elType: (event.target as HTMLInputElement).tagName,
      },
    });
  };

  return (
    <IonRadioGroup value={props.value} name={props.name} onIonChange={(e) => updateAction(e, props.actionType)}>
      <IonItem lines="none" className="only-label">
        <IonItem lines="none" className="only-label no-padding">
          <IonLabel color="dark" title={props.title}>
            {props.title}
          </IonLabel>
          {props.required && (
            <IonLabel slot="end" color="dark" className="left-padding">
              *
            </IonLabel>
          )}
        </IonItem>
        {props.infoContent && props.infoContentTitle && (
          <IonLabel slot="end">
            <Modal title={props.infoContentTitle} content={props.infoContent} />
          </IonLabel>
        )}
      </IonItem>
      <IonGrid className="no-padding">
        <IonRow>
          {props.options.map((option) => (
            <IonCol key={option.id}>
              <IonItem lines="none" className={(props.value === option ? '' : 'item-radio-unchecked ') + 'no-padding align-center'}>
                <IonLabel className="ion-text-wrap">
                  {option.img && <IonImg src={option.img} />}
                  <p>{props.translateOptions ? t(option.name) : option.name}</p>
                  <IonRadio value={option} className={props.value === option ? 'radio-checked' : 'radio-unchecked'} />
                </IonLabel>
              </IonItem>
            </IonCol>
          ))}
        </IonRow>
      </IonGrid>
    </IonRadioGroup>
  );
};

export default RadioSelectField;
