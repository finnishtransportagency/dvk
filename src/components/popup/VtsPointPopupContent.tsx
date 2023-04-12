import React from 'react';
import { IonButton, IonCol, IonGrid, IonIcon, IonRow } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import './popup.css';
import { coordinatesToStringHDM } from '../../utils/CoordinateUtils';
import { VtsFeatureProperties } from '../features';
import { PopupProperties } from '../mapOverlays/MapOverlays';
import { InfoParagraph } from '../content/Paragraph';

export type VtsPopupContentProps = {
  vts: VtsProperties;
  setPopupProperties?: (properties: PopupProperties) => void;
};

export type VtsProperties = {
  coordinates: number[];
  properties: VtsFeatureProperties;
};

const VtsPointPopupContent: React.FC<VtsPopupContentProps> = ({ vts, setPopupProperties }) => {
  const { t } = useTranslation();
  const closePopup = () => {
    if (setPopupProperties) setPopupProperties({});
  };

  return (
    <IonGrid id="vtsPopupContent" class="ion-padding">
      <IonGrid class="ion-no-padding">
        <IonRow className="ion-justify-content-between">
          <IonCol size="auto" className="header">
            {vts.properties.name}
          </IonCol>
          <IonCol size="auto">
            <IonButton fill="clear" className="closeButton" onClick={() => closePopup()} title={t('common.close')} aria-label={t('common.close')}>
              <IonIcon className="otherIconLarge" src="assets/icon/close_black_24dp.svg" />
            </IonButton>
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol className="header">{t('popup.vts.coordinates')}</IonCol>
        </IonRow>
        <IonRow>
          <IonCol>{coordinatesToStringHDM(vts.coordinates) || <InfoParagraph title={t('common.noData')} />}</IonCol>
        </IonRow>
        <IonRow>
          <IonCol className="header">{t('popup.vts.point')}</IonCol>
        </IonRow>
        <IonRow>
          <IonCol>{vts.properties.information}</IonCol>
        </IonRow>
        {vts.properties.channel && (
          <>
            <IonRow>
              <IonCol className="header">{t('popup.vts.channel')}</IonCol>
            </IonRow>
            <IonRow>
              <IonCol>{vts.properties.channel}</IonCol>
            </IonRow>
          </>
        )}
      </IonGrid>
    </IonGrid>
  );
};

export default VtsPointPopupContent;
