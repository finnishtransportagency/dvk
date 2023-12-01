import React from 'react';
import { IonCol, IonGrid, IonRow } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import './popup.css';
import { VtsPopupContentProps } from './VtsPointPopupContent';
import { deselectClickSelection } from './selectInteraction';
import CloseButton from './CloseButton';

const VtsLinePopupContent: React.FC<VtsPopupContentProps> = ({ vts, setPopupProperties }) => {
  const { t } = useTranslation();

  const closePopup = () => {
    if (setPopupProperties) setPopupProperties({});
    deselectClickSelection();
  };

  return (
    <IonGrid className="ion-no-padding">
      <IonRow className="ion-justify-content-between">
        <IonCol size="auto" className="header">
          {vts.properties.name ?? t('popup.vts.line')}
        </IonCol>
        <IonCol size="auto">
          <CloseButton close={closePopup} />
        </IonCol>
      </IonRow>
      {vts.properties.name && (
        <IonRow>
          <IonCol className="header">{t('popup.vts.line')}</IonCol>
        </IonRow>
      )}
      <IonRow>
        <IonCol>{vts.properties.information}</IonCol>
      </IonRow>
    </IonGrid>
  );
};

export default VtsLinePopupContent;
