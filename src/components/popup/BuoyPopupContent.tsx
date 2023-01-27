import React from 'react';
import { IonCol, IonGrid, IonRow } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import './popup.css';
import { coordinatesToStringHDM } from '../../utils/CoordinateUtils';
import { BuoyFeatureProperties } from '../features';

type BuoyPopupContentProps = {
  buoy: BuoyProperties;
};

export type BuoyProperties = {
  coordinates: number[];
  properties: BuoyFeatureProperties;
};

const BuoyPopupContent: React.FC<BuoyPopupContentProps> = ({ buoy }) => {
  const { t } = useTranslation('', { keyPrefix: 'popup.buoy' });
  return (
    <IonGrid id="buoyPopupContent" class="ion-padding">
      <IonGrid class="ion-no-padding">
        <IonRow>
          <IonCol className="header">{buoy.properties.name}</IonCol>
        </IonRow>
        <IonRow>
          <IonCol className="header">{t('coordinates')}</IonCol>
        </IonRow>
        {buoy.coordinates && (
          <IonRow>
            <IonCol>{coordinatesToStringHDM(buoy.coordinates)}</IonCol>
          </IonRow>
        )}
        <IonRow>
          <IonCol className="header">{t('dateTime')}</IonCol>
        </IonRow>
        <IonRow>
          <IonCol>{t('dateTimeFormat', { val: buoy.properties.dateTime })}</IonCol>
        </IonRow>
        <IonRow>
          <IonCol className="header">{t('waveHeightDir')}</IonCol>
        </IonRow>
        <IonRow>
          <IonCol>{`${buoy.properties.waveHeight ? Math.round(buoy.properties.waveHeight) : '-'} m/s, ${
            buoy.properties.waveDirection ? Math.round(buoy.properties.waveDirection) : '-'
          } °`}</IonCol>
        </IonRow>
        <IonRow>
          <IonCol className="header">{t('temperature')}</IonCol>
        </IonRow>
        <IonRow>
          <IonCol>{`${buoy.properties.temperature ? Math.round(buoy.properties.temperature) : '-'} °C`}</IonCol>
        </IonRow>
      </IonGrid>
    </IonGrid>
  );
};

export default BuoyPopupContent;
