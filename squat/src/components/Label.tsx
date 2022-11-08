import React, { ReactElement } from 'react';
import { IonItem, IonLabel } from '@ionic/react';
import Modal from './Modal';

interface LabelProps {
  title: string;
  description?: string;
  required?: boolean;
  infoContentTitle?: string;
  infoContent?: string | ReactElement;
}

const Label: React.FC<LabelProps> = (props) => {
  return (
    <IonItem lines="none" className="only-label">
      <IonItem lines="none" className="only-label no-padding">
        <IonLabel color="dark" title={props.description ? props.description : props.title}>
          {props.title}
        </IonLabel>
        {props.required && (
          <IonLabel slot="end" color="dark" className="left-padding">
            *
          </IonLabel>
        )}
        {props.infoContent && props.infoContentTitle && (
          <IonLabel slot="end">
            <Modal title={props.infoContentTitle} content={props.infoContent} />
          </IonLabel>
        )}
      </IonItem>
    </IonItem>
  );
};

export default Label;
