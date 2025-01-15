import React from 'react';
import { IonCol, IonGrid, IonIcon, IonRow, IonText } from '@ionic/react';
import { Trans, useTranslation } from 'react-i18next';
import { useDvkContext } from '../../../hooks/dvkContext';
import alertIcon from '../../../theme/img/alert_icon.svg';
import { Link } from 'react-router-dom';

interface AlertProps {
  fairwayCardId?: string;
  errorText?: string;
}

export const Alert: React.FC<AlertProps> = ({ fairwayCardId, errorText }) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });
  const { state } = useDvkContext();

  return (
    <IonGrid className={(fairwayCardId ? 'top-margin' : '') + ' alert danger'}>
      <IonRow className="ion-align-items-center">
        <IonCol size="auto" className="icon">
          <IonIcon icon={alertIcon} color="danger" />
        </IonCol>
        {fairwayCardId && (
          <IonCol>
            {state.preview ? (
              <Trans t={t} i18nKey="previewAlert">
                The {{ fairwayCardId }} fairway card you requested was not found. Check the site address for typos.
              </Trans>
            ) : (
              <Trans t={t} i18nKey="alert">
                The {{ fairwayCardId }} fairway card you requested was not found. Check the site address for typos. You can also check if the fairway
                card you are looking for can be found in the <Link to="/kortit">Fairway cards</Link> listing.
              </Trans>
            )}
          </IonCol>
        )}
        {errorText && (
          <IonCol>
            <IonText>{errorText}</IonText>
          </IonCol>
        )}
      </IonRow>
    </IonGrid>
  );
};
