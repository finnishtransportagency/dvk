import { IonCol, IonGrid, IonIcon, IonRow, IonText } from '@ionic/react';
import React from 'react';
import infoIcon from '../../../theme/img/info.svg';

interface AdditionalInfoAlertProps {
  additionalInfo: string | undefined | null;
}

export const AdditionalInfoAlert: React.FC<AdditionalInfoAlertProps> = ({ additionalInfo }) => {
  return (
    <IonGrid className="top-margin additionalInfoAlert">
      <IonRow className="ion-no-padding">
        <IonCol className="icon">
          <IonIcon className="info" icon={infoIcon} />
        </IonCol>
        <IonCol>
          <IonText>{additionalInfo}</IonText>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};
