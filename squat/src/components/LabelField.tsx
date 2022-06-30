import React, { ReactElement } from 'react';
import { IonIcon, IonItem, IonLabel, IonNote, IonText } from '@ionic/react';
import { alertCircleOutline } from 'ionicons/icons';

interface LabelProps {
  title: string;
  value: number | string | null;
  unit?: string | ReactElement;
  error?: string;
  helper?: string;
}

const LabelField: React.FC<LabelProps> = (props) => {
  return (
    <>
      <IonItem lines="none" className="only-label">
        <IonLabel color="dark" title={props.title}>
          {props.title}
        </IonLabel>
      </IonItem>
      <IonItem lines="none">
        <IonText color={props.error ? 'danger' : 'dark'} title={props.error ? props.error : ''} className="input-error">
          {props.error && <IonIcon icon={alertCircleOutline} color="danger" size="small" />}
          {props.value}
        </IonText>
        {props.unit && (
          <IonLabel slot="end" color="medium">
            {props.unit}
          </IonLabel>
        )}
        {props.helper && <IonNote slot="helper">{props.helper}</IonNote>}
      </IonItem>
    </>
  );
};

export default LabelField;
