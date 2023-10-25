import React from 'react';
import { useTranslation } from 'react-i18next';
import './popup.css';
import { AisFeatureProperties } from '../features';
import { PopupProperties } from '../mapOverlays/MapOverlays';
import { deselectClickSelection } from './popup';
import { IonButton, IonCol, IonGrid, IonIcon, IonRow } from '@ionic/react';
import closeIcon from '../../theme/img/close_black_24dp.svg';
//import { coordinatesToStringHDM } from '../../utils/CoordinateUtils';
import { getAisVesselShipType } from '../../utils/common';

type AisVesselPopupContentProps = {
  vessel: AisVesselProperties;
  setPopupProperties?: (properties: PopupProperties) => void;
};
export type AisVesselProperties = {
  coordinates: number[];
  properties: AisFeatureProperties;
};

const AisVesselPopupContent: React.FC<AisVesselPopupContentProps> = ({ vessel, setPopupProperties }) => {
  const { t } = useTranslation();
  const properties = vessel.properties;

  const closePopup = () => {
    if (setPopupProperties) setPopupProperties({});
    deselectClickSelection();
  };
  return (
    <IonGrid id="aisVesselPopupContent">
      <IonGrid className="ion-no-padding">
        <IonRow className="ion-justify-content-between">
          <IonCol size="auto" className="header">
            {properties.name}
          </IonCol>
          <IonCol size="auto">
            <IonButton fill="clear" className="closeButton" onClick={() => closePopup()} title={t('common.close')} aria-label={t('common.close')}>
              <IonIcon className="otherIconLarge" src={closeIcon} />
            </IonButton>
          </IonCol>
        </IonRow>
        <IonRow id="higher"> {t(`homePage.map.controls.layer.${getAisVesselShipType(properties?.shipType)}`)}</IonRow>
        <IonRow>
          <IonCol className="header">{t('popup.ais.lastUpdated')}</IonCol>
        </IonRow>
        <IonRow>
          <IonCol>placeholder</IonCol>
        </IonRow>
        <IonRow>
          <IonCol className="header">{t('popup.ais.lastLocation')}</IonCol>
        </IonRow>
        <IonRow>
          <IonCol>placeholder</IonCol>
        </IonRow>
        <IonRow>
          <IonCol className="header">{t('popup.ais.navState')}</IonCol>
        </IonRow>
        <IonRow>
          <IonCol>placeholder</IonCol>
        </IonRow>
        <IonRow>
          <IonCol className="header">MMSI</IonCol>
        </IonRow>
        <IonRow>
          <IonCol>placeholder</IonCol>
        </IonRow>
        <IonRow>
          <IonCol className="header">{t('popup.ais.callSign')}</IonCol>
        </IonRow>
        <IonRow>
          <IonCol>placeholder</IonCol>
        </IonRow>
        <IonRow>
          <IonCol className="header">IMO</IonCol>
        </IonRow>
        <IonRow>
          <IonCol>placeholder</IonCol>
        </IonRow>
        <IonRow>
          <IonCol className="header">{t('popup.ais.dimensions')}</IonCol>
        </IonRow>
        <IonRow>
          <IonCol>placeholder</IonCol>
        </IonRow>
        <IonRow>
          <IonCol className="header">{t('popup.ais.draught')}</IonCol>
        </IonRow>
        <IonRow>
          <IonCol>placeholder</IonCol>
        </IonRow>
        <IonRow>
          <IonCol className="header">{t('popup.ais.destination')}</IonCol>
        </IonRow>
        <IonRow>
          <IonCol>placeholder</IonCol>
        </IonRow>
      </IonGrid>
    </IonGrid>
  );
};

export default AisVesselPopupContent;
