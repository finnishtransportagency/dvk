import React from 'react';
import { IonCol, IonGrid, IonIcon, IonRow, IonText } from '@ionic/react';
import { checkmarkCircle, radioButtonOff } from 'ionicons/icons';

interface SectionProps {
  title: string;
  valid?: boolean;
  hideValidity?: boolean;
}

const SectionTitle: React.FC<SectionProps> = (props) => {
  return (
    <IonGrid className="no-padding divider margin-top">
      <IonRow>
        <IonCol>
          <IonText color="dark" className="no-margin">
            <h3>
              <strong>{props.title}</strong>
            </h3>
          </IonText>
        </IonCol>
        {!props.hideValidity && (
          <IonCol size="auto" className="ion-align-self-center">
            <IonIcon icon={props.valid ? checkmarkCircle : radioButtonOff} color={props.valid ? 'success' : 'medium'} className="medium" />
          </IonCol>
        )}
      </IonRow>
    </IonGrid>
  );
};

export default SectionTitle;
