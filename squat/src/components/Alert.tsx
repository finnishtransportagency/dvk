import React, { ReactElement, useCallback, useState } from 'react';
import { IonButton, IonCol, IonGrid, IonIcon, IonRow, IonText } from '@ionic/react';
import { closeOutline } from 'ionicons/icons';
import info from '../theme/img/info-circle-solid.svg';
import green from '../theme/img/green_info_icon.svg';
import warning from '../theme/img/warning_icon.svg';
import alert from '../theme/img/alert_icon.svg';
import { useTranslation } from 'react-i18next';

interface AlertProps {
  title: string | ReactElement;
  alertType: 'info' | 'success' | 'warning' | 'error';
  className?: string;
  closable?: boolean;
}

const Alert: React.FC<AlertProps> = ({ title, alertType, className, closable = false }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(true);

  const handleClickClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const iconByType = () => {
    if (alertType === 'info') return info;
    if (alertType === 'success') return green;
    if (alertType === 'warning') return warning;
    if (alertType === 'error') return alert;
  };

  if (!isOpen) {
    return <></>;
  }

  return (
    <IonGrid className={'infobox ' + alertType + ' ' + (className ?? '')}>
      <IonRow className="ion-align-items-center">
        <IonCol size="auto" className="icon">
          <IonIcon aria-label={alertType} icon={iconByType()} />
        </IonCol>
        <IonCol>
          <IonText>{title}</IonText>
        </IonCol>
        {closable && (
          <IonCol size="auto">
            <IonButton
              onClick={handleClickClose}
              className="icon-only button-clear no-background-focused no-box-shadow"
              title={t('common.close-dialog')}
              aria-label={t('common.close-dialog')}
            >
              <IonIcon aria-label={t('common.close-dialog')} icon={closeOutline} />
            </IonButton>
          </IonCol>
        )}
      </IonRow>
    </IonGrid>
  );
};

export default Alert;
