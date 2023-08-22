import React, { ReactElement, useCallback, useState } from 'react';
import { IonButton, IonCol, IonGrid, IonIcon, IonRow, IonText } from '@ionic/react';
import { closeOutline } from 'ionicons/icons';
import infoIcon from '../theme/img/info-circle-solid.svg';
import successIcon from '../theme/img/green_info_icon.svg';
import warningIcon from '../theme/img/warning_icon.svg';
import errorIcon from '../theme/img/alert_icon.svg';

interface AlertProps {
  title: string | ReactElement;
  alertType: 'info' | 'success' | 'warning' | 'error';
  className?: string;
  closable?: boolean;
}

const Alert: React.FC<AlertProps> = ({ title, alertType, className, closable = false }) => {
  const [isOpen, setIsOpen] = useState(true);

  const handleClickClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const iconByType = () => {
    if (alertType === 'info') return infoIcon;
    if (alertType === 'success') return successIcon;
    if (alertType === 'warning') return warningIcon;
    if (alertType === 'error') return errorIcon;
  };

  if (!isOpen) {
    return <></>;
  }

  return (
    <IonGrid className={className ? 'infobox ' + alertType + ' ' + className : 'infobox ' + alertType}>
      <IonRow className="ion-align-items-center">
        <IonCol size="auto" className="icon">
          <IonIcon icon={iconByType()} color="danger" />
        </IonCol>
        <IonCol>
          <IonText>{title}</IonText>
        </IonCol>
        {closable && (
          <IonCol size="auto">
            <IonButton onClick={handleClickClose} className="icon-only" title={'close-dialog'} aria-label={'close-dialog'}>
              <IonIcon icon={closeOutline} />
            </IonButton>
          </IonCol>
        )}
      </IonRow>
    </IonGrid>
  );
};

export default Alert;
