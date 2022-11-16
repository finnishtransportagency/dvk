import React, { ReactElement } from 'react';
import { IonCol, IonGrid, IonImg, IonItem, IonLabel, IonRadio, IonRadioGroup, IonRow } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { useSquatContext } from '../hooks/squatContext';
import { Action } from '../hooks/squatReducer';
import Modal from './Modal';

export type OptionType = {
  id: number;
  name: string;
  img?: string;
  desc?: string;
  opaque?: boolean;
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
  infoContentSize?: 'medium' | 'large';
  columnSize?: string;
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
    <IonRadioGroup value={props.value} name={props.name} onIonChange={(e) => updateAction(e, props.actionType)} aria-label={props.title}>
      <IonItem lines="none" className="only-label no-focus">
        <IonItem lines="none" className="only-label no-padding no-focus">
          <IonLabel color="dark" title={props.title}>
            {props.title}
          </IonLabel>
          {props.required && (
            <IonLabel slot="end" color="dark" className="left-padding">
              *
            </IonLabel>
          )}
          {props.infoContent && props.infoContentTitle && (
            <IonLabel slot="end">
              <Modal title={props.infoContentTitle} content={props.infoContent} size={props.infoContentSize} />
            </IonLabel>
          )}
        </IonItem>
      </IonItem>
      <IonGrid className="no-padding" style={{ marginTop: '1px' }}>
        <IonRow>
          {props.options.map((option) => (
            <IonCol key={option.id} className={props.value === option ? 'col-radio' : 'col-radio-unchecked '} size={props.columnSize}>
              <IonItem
                lines="none"
                className={(props.value === option ? '' : 'item-radio-unchecked ') + 'no-padding align-center no-background-focused'}
                mode="md"
              >
                <IonLabel className="ion-text-wrap radio">
                  {option.img && <IonImg className={option.opaque ? 'opaque' : ''} src={option.img} />}
                  <p>{props.translateOptions ? t(option.name) : option.name}</p>
                  <IonRadio
                    id={t(option.name, { lng: 'en' })}
                    name={t(option.name, { lng: 'en' })}
                    value={option}
                    className={props.value === option ? 'radio-checked' : 'radio-unchecked'}
                    mode="md"
                  />
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
