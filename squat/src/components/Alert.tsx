import React, { ReactElement, useCallback, useState } from 'react';
import { IonButton, IonCol, IonGrid, IonIcon, IonRow, IonText } from '@ionic/react';
import { closeOutline } from 'ionicons/icons';
import { getAssetUrl } from '../utils/helpers';

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
    if (alertType === 'info') return getAssetUrl('assets/info-circle-solid.svg');
    if (alertType === 'success') return getAssetUrl('assets/green_info_icon.svg');
    if (alertType === 'warning') return getAssetUrl('assets/warning_icon.svg');
    if (alertType === 'error') return getAssetUrl('assets/alert_icon.svg');
  };

  if (!isOpen) {
    return <></>;
  }

  return (
    <IonGrid className={'infobox ' + alertType + ' ' + (className ?? '')}>
      <IonRow className="ion-align-items-center">
        <IonCol size="auto" className="icon">
          <IonIcon icon={iconByType()} />
        </IonCol>
        <IonCol>
          <IonText>{title}</IonText>
        </IonCol>
        {closable && (
          <IonCol size="auto">
            <IonButton
              onClick={handleClickClose}
              className="icon-only button-clear no-background-focused no-box-shadow"
              title={'close-dialog'}
              aria-label={'close-dialog'}
            >
              <IonIcon icon={closeOutline} />
            </IonButton>
          </IonCol>
        )}
      </IonRow>
    </IonGrid>
  );
};

export default Alert;
