import React, { ReactElement } from 'react';
import { IonCol, IonGrid, IonIcon, IonItem, IonRow, IonText } from '@ionic/react';
import { warningOutline } from 'ionicons/icons';

interface AlertProps {
  title: string | ReactElement;
  color: string;
  className?: string;
}

const Alert: React.FC<AlertProps> = (props) => {
  return (
    <IonGrid className={(props.className ? 'danger ' + props.className : 'danger') + ' ' + props.color}>
      <IonRow className="ion-align-items-center">
        <IonCol size="auto" className="icon">
          <IonIcon icon={warningOutline} color={props.color} />
        </IonCol>
        <IonCol>
          <IonText>{props.title}</IonText>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};

export const AlertLayer: React.FC<AlertProps> = (props) => {
  return (
    <IonRow>
      <IonCol>
        <IonItem>
          <IonIcon className="icon" size="small" icon={warningOutline} color={props.color} />
          <IonText className={props.className + ' ' + props.color}>{props.title}</IonText>
        </IonItem>
      </IonCol>
    </IonRow>
  );
};

export default Alert;
