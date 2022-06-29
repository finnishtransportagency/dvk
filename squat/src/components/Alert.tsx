import React, { ReactElement } from 'react';
import { IonCol, IonGrid, IonIcon, IonRow, IonText } from '@ionic/react';
import { warningOutline } from 'ionicons/icons';

interface AlertProps {
  title: string | ReactElement;
}

const Alert: React.FC<AlertProps> = (props) => {
  return (
    <IonGrid className="danger">
      <IonRow className="ion-align-items-center">
        <IonCol size="auto" className="icon">
          <IonIcon icon={warningOutline} color="danger" />
        </IonCol>
        <IonCol>
          <IonText>{props.title}</IonText>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};

export default Alert;
