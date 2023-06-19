import React, { ReactElement } from 'react';
import { IonItem, IonLabel } from '@ionic/react';
import Modal from './Modal';

interface LabelProps {
  title: string;
  description?: string;
  required?: boolean;
  infoContentTitle?: string;
  infoContent?: string | ReactElement;
  infoContentSize?: 'medium' | 'large';
}

const Label: React.FC<LabelProps> = (props) => {
  return (
    <IonItem lines="none" className="only-label no-focus">
      <IonItem lines="none" className="only-label no-padding no-focus">
        <IonLabel color="dark" title={props.description ? props.description : props.title}>
          {props.title}
        </IonLabel>
        {props.required && (
          <IonLabel slot="end" color="dark" className="input-required-marker left-padding">
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
  );
};

export default Label;
