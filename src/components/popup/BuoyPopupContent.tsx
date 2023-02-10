import React from 'react';
import { IonButton, IonCol, IonGrid, IonIcon, IonRow } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import './popup.css';
import { coordinatesToStringHDM } from '../../utils/CoordinateUtils';
import { BuoyFeatureProperties } from '../features';
import { PopupProperties } from '../mapOverlays/MapOverlays';

type BuoyPopupContentProps = {
  buoy: BuoyProperties;
  setPopupProperties?: (properties: PopupProperties) => void;
};

export type BuoyProperties = {
  coordinates: number[];
  properties: BuoyFeatureProperties;
};

const BuoyPopupContent: React.FC<BuoyPopupContentProps> = ({ buoy, setPopupProperties }) => {
  const { t } = useTranslation();

  const closePopup = () => {
    if (setPopupProperties) setPopupProperties({});
  };

  return (
    <IonGrid id="buoyPopupContent" class="ion-padding">
      <IonGrid class="ion-no-padding">
        <IonRow className="ion-justify-content-between">
          <IonCol size="auto" className="header">
            {buoy.properties.name}
          </IonCol>
          <IonCol size="auto">
            <IonButton fill="clear" className="closeButton" onClick={() => closePopup()} title={t('common.close')} aria-label={t('common.close')}>
              <IonIcon className="otherIconLarge" src="/assets/icon/close_black_24dp.svg" />
            </IonButton>
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol className="header">{t('popup.buoy.coordinates')}</IonCol>
        </IonRow>
        {buoy.coordinates && (
          <IonRow>
            <IonCol>{coordinatesToStringHDM(buoy.coordinates)}</IonCol>
          </IonRow>
        )}
        <IonRow>
          <IonCol className="header">{t('popup.buoy.dateTime')}</IonCol>
        </IonRow>
        <IonRow>
          <IonCol>{t('popup.buoy.dateTimeFormat', { val: buoy.properties.dateTime })}</IonCol>
        </IonRow>
        <IonRow>
          <IonCol className="header">{t('popup.buoy.waveHeightDir')}</IonCol>
        </IonRow>
        <IonRow>
          <IonCol>{`${buoy.properties.waveHeight ? buoy.properties.waveHeight : '-'} m/s, ${
            buoy.properties.waveDirection ? Math.round(buoy.properties.waveDirection) : '-'
          } °`}</IonCol>
        </IonRow>
        <IonRow>
          <IonCol className="header">{t('popup.buoy.temperature')}</IonCol>
        </IonRow>
        <IonRow>
          <IonCol>{`${buoy.properties.temperature ? Math.round(buoy.properties.temperature) : '-'} °C`}</IonCol>
        </IonRow>
      </IonGrid>
    </IonGrid>
  );
};

export default BuoyPopupContent;
