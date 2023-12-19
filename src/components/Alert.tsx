import React, { ReactElement, useEffect } from 'react';
import { IonCol, IonGrid, IonIcon, IonItem, IonRow, IonText } from '@ionic/react';
import { useDvkContext } from '../hooks/dvkContext';
import { t } from 'i18next';

interface AlertProps {
  title: string | ReactElement;
  icon: string;
  color?: string;
  className?: string;
  mainLegendOpen?: boolean;
}

const Alert: React.FC<AlertProps> = (props) => {
  return (
    <IonGrid className={props.className ? props.className : undefined}>
      <IonRow className="ion-align-items-center">
        <IonCol size="auto" className="icon">
          <IonIcon icon={props.icon} color={props.color} />
        </IonCol>
        <IonCol>
          <IonText>{props.title}</IonText>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};

export const LayerAlert: React.FC<AlertProps> = (props) => {
  const { dispatch } = useDvkContext();

  useEffect(() => {
    if (props.mainLegendOpen) {
      dispatch({
        type: 'setResponse',
        payload: {
          value: [String(503), 'Service Unavailable', t('warnings.layerLoadError')],
        },
      });
    }
  }, [dispatch, props.mainLegendOpen]);

  return (
    <IonRow>
      <IonCol>
        <IonItem>
          <IonIcon className="icon" size="small" icon={props.icon} color={props.color} />
          <IonText className={props.className ? props.color + ' ' + props.className : props.color}>{props.title}</IonText>
        </IonItem>
      </IonCol>
    </IonRow>
  );
};

export default Alert;
