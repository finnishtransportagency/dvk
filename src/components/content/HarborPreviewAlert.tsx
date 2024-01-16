import React from 'react';
import { IonCol, IonGrid, IonIcon, IonRow } from '@ionic/react';
import { Trans, useTranslation } from 'react-i18next';
import alertIcon from '../../theme/img/alert_icon.svg';

interface HarborPreviewAlertProps {
  harborId: string;
}

export const HarborPreviewAlert: React.FC<HarborPreviewAlertProps> = ({ harborId }) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });
  return (
    <IonGrid className="top-margin alert danger">
      <IonRow className="ion-align-items-center">
        <IonCol size="auto" className="icon">
          <IonIcon icon={alertIcon} color="danger" />
        </IonCol>
        <IonCol>
          <Trans t={t} i18nKey="harborPreviewAlert">
            The {{ harborId }} harbour you requested was not found. Check the site address for typos.
          </Trans>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};
