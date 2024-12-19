import React, { ReactElement } from 'react';
import { IonLabel, IonText } from '@ionic/react';
import Modal from './Modal';

interface LabelProps {
  id: string;
  title: string;
  description?: string;
  required?: boolean;
  infoContentTitle?: string;
  infoContent?: string | ReactElement;
  infoContentSize?: 'medium' | 'large';
}

const Label: React.FC<LabelProps> = (props) => {
  return (
    <IonLabel id={props.id}>
      <div className="labelContainer">
        <IonText className="collapsible" color="dark" title={props.description ? props.description : props.title}>
          {props.title}
        </IonText>
        {props.required && (
          <IonText color="dark" className="input-required-marker">
            *
          </IonText>
        )}
        {props.infoContent && props.infoContentTitle && (
          <Modal title={props.infoContentTitle} content={props.infoContent} size={props.infoContentSize} triggerClassName="no-background-focused" />
        )}
      </div>
    </IonLabel>
  );
};

export default Label;
