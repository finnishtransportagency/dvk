import React, { ReactElement } from 'react';
import { IonCol, IonGrid, IonIcon, IonRow, IonText } from '@ionic/react';
import { checkmarkCircle, radioButtonOff } from 'ionicons/icons';
import Modal from './Modal';

interface SectionProps {
  title: string;
  valid?: boolean;
  hideValidity?: boolean;
  infoContentTitle?: string;
  infoContent?: string | ReactElement;
}

const SectionTitle: React.FC<SectionProps> = (props) => {
  return (
    <IonGrid className="no-padding divider margin-top">
      <IonRow>
        <IonCol>
          <IonText color="dark" className="no-margin">
            <h3>
              <strong style={{ verticalAlign: 'middle' }}>{props.title}</strong>
              {props.infoContent && props.infoContentTitle && <Modal title={props.infoContentTitle} content={props.infoContent} />}
            </h3>
          </IonText>
        </IonCol>
        {!props.hideValidity && (
          <IonCol size="auto" className="ion-align-self-center">
            <IonIcon
              icon={props.valid ? checkmarkCircle : radioButtonOff}
              color={props.valid ? 'success' : 'medium'}
              className="medium section-validation"
            />
          </IonCol>
        )}
      </IonRow>
    </IonGrid>
  );
};

export default SectionTitle;
