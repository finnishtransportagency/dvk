import React, { ReactElement } from 'react';
import { IonIcon, IonItem, IonLabel, IonNote, IonText } from '@ionic/react';
import { alertCircleOutline } from 'ionicons/icons';
import Label from './Label';

interface LabelProps {
  title: string;
  value: number | string | null;
  unit?: string | ReactElement;
  error?: string;
  helper?: string;
  infoContentTitle?: string;
  infoContent?: string | ReactElement;
}

const LabelField: React.FC<LabelProps> = (props) => {
  return (
    <>
      <Label title={props.title} infoContentTitle={props.infoContentTitle} infoContent={props.infoContent} />

      <IonItem lines="none">
        <IonText color={props.error ? 'danger' : 'dark'} title={props.error ? props.error : ''} className={props.error ? 'input-error' : ''}>
          {props.error && <IonIcon icon={alertCircleOutline} color="danger" />}
          {props.value}
        </IonText>
        {props.unit && <IonLabel color="medium">&nbsp;{props.unit}</IonLabel>}
        {props.helper && <IonNote slot="helper">{props.helper}</IonNote>}
      </IonItem>
    </>
  );
};

export default LabelField;
