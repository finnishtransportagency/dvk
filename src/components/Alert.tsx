import React, { ReactElement } from 'react';
import { IonCol, IonGrid, IonIcon, IonItem, IonRow, IonText } from '@ionic/react';
import { getAssetUrl } from '../utils/common';

interface AlertProps {
  title: string | ReactElement;
  icon: string;
  color?: string;
  className?: string;
}

const Alert: React.FC<AlertProps> = (props) => {
  return (
    <IonGrid className={props.className ? props.className : undefined}>
      <IonRow className="ion-align-items-center">
        <IonCol size="auto" className="icon">
          <IonIcon icon={getAssetUrl(props.icon)} color={props.color} />
        </IonCol>
        <IonCol>
          <IonText>{props.title}</IonText>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};

export const LayerAlert: React.FC<AlertProps> = (props) => {
  return (
    <IonRow>
      <IonCol>
        <IonItem>
          <IonIcon className="icon" size="small" icon={getAssetUrl(props.icon)} color={props.color} />
          <IonText className={props.className ? props.color + ' ' + props.className : props.color}>{props.title}</IonText>
        </IonItem>
      </IonCol>
    </IonRow>
  );
};

export default Alert;
