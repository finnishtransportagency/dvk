import React, { ReactNode } from 'react';
import infoIcon from '../theme/img/info-circle-solid.svg';
import successIcon from '../theme/img/green_info_icon.svg';
import warningIcon from '../theme/img/warning_icon.svg';
import errorIcon from '../theme/img/alert_icon.svg';
import { IonCol, IonGrid, IonIcon, IonRow, IonText } from '@ionic/react';

interface AlertProps {
  alertType: 'info' | 'success' | 'warning' | 'error';
  text: string;
  extraClass?: string;
  children?: ReactNode;
}

const Alert: React.FC<AlertProps> = ({ alertType, extraClass, text, children }) => {
  const iconByType = () => {
    if (alertType === 'info') return infoIcon;
    if (alertType === 'success') return successIcon;
    if (alertType === 'warning') return warningIcon;
    if (alertType === 'error') return errorIcon;
  };
  return (
    <IonGrid className={'ion-no-padding alert ' + alertType + (extraClass ? ' ' + extraClass : '')}>
      <IonRow className="ion-align-items-center">
        <IonCol size="auto">
          <IonIcon className={alertType} icon={iconByType()} aria-hidden="true" />
        </IonCol>
        <IonCol>
          <IonText>{text}</IonText>
        </IonCol>
      </IonRow>
      <IonRow>
        <IonCol size="auto"></IonCol>
        <IonCol>
          <IonText>{children}</IonText>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};

export default Alert;
