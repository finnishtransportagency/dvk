import React from 'react';
import { IonButton, IonCol, IonGrid, IonIcon, IonRow } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import './popup.css';
import { VtsPopupContentProps } from './VtsPointPopupContent';

const VtsLinePopupContent: React.FC<VtsPopupContentProps> = ({ vts, setPopupProperties }) => {
  const { t } = useTranslation();
  const closePopup = () => {
    if (setPopupProperties) setPopupProperties({});
  };

  return (
    <IonGrid id="vtsPopupContent" class="ion-padding">
      <IonGrid class="ion-no-padding">
        <IonRow className="ion-justify-content-between">
          <IonCol size="auto" className="header">
            {vts.properties.name ? vts.properties.name : vts.properties.identifier}
          </IonCol>
          <IonCol size="auto">
            <IonButton fill="clear" className="closeButton" onClick={() => closePopup()} title={t('common.close')} aria-label={t('common.close')}>
              <IonIcon className="otherIconLarge" src="assets/icon/close_black_24dp.svg" />
            </IonButton>
          </IonCol>
        </IonRow>
        {vts.properties.name && (
          <IonRow className="header">
            <IonCol>{vts.properties.identifier}</IonCol>
          </IonRow>
        )}
        <IonRow>
          <IonCol className="header">{t('popup.vts.line')}</IonCol>
        </IonRow>
        <IonRow>
          <IonCol>{vts.properties.information}</IonCol>
        </IonRow>
      </IonGrid>
    </IonGrid>
  );
};

export default VtsLinePopupContent;
