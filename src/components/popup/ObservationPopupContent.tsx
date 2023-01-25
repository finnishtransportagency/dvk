import React from 'react';
import { IonCol, IonGrid, IonRow } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import './popup.css';
import { coordinatesToStringHDM } from '../../utils/CoordinateUtils';
import { ObservationFeatureProperties } from '../features';

type ObservationPopupContentProps = {
  observation: ObservationProperties;
};

export type ObservationProperties = {
  coordinates: number[];
  properties: ObservationFeatureProperties;
};

const ObservationPopupContent: React.FC<ObservationPopupContentProps> = ({ observation }) => {
  const { t } = useTranslation('', { keyPrefix: 'popup.observation' });
  return (
    <IonGrid id="observationPopupContent" class="ion-padding">
      <IonGrid class="ion-no-padding">
        <IonRow>
          <IonCol className="header">{observation.properties.name}</IonCol>
        </IonRow>
        <IonRow>
          <IonCol>{t('observation')}</IonCol>
        </IonRow>
        <IonRow>
          <IonCol className="header">{t('coordinates')}</IonCol>
        </IonRow>
        {observation.coordinates && (
          <IonRow>
            <IonCol>{coordinatesToStringHDM(observation.coordinates)}</IonCol>
          </IonRow>
        )}
        <IonRow>
          <IonCol className="header">{t('dateTime')}</IonCol>
        </IonRow>
        <IonRow>
          <IonCol>{t('dateTimeFormat', { val: observation.properties.dateTime })}</IonCol>
        </IonRow>
        <IonRow>
          <IonCol className="header">{t('windSpeedAvgDir')}</IonCol>
        </IonRow>
        <IonRow>
          <IonCol>{`${Math.round(observation.properties.windSpeedAvg)} m/s, ${Math.round(observation.properties.windDirection)} °`}</IonCol>
        </IonRow>
        <IonRow>
          <IonCol className="header">{t('windSpeedMax')}</IonCol>
        </IonRow>
        <IonRow>
          <IonCol>{`${Math.round(observation.properties.windSpeedMax)} m/s`}</IonCol>
        </IonRow>
        <IonRow>
          <IonCol className="header">{t('temperature')}</IonCol>
        </IonRow>
        <IonRow>
          <IonCol>{`${Math.round(observation.properties.temperature)} °C`}</IonCol>
        </IonRow>
        <IonRow>
          <IonCol className="header">{t('visibility')}</IonCol>
        </IonRow>
        <IonRow>
          <IonCol>{`${observation.properties.visibility ? Math.round(observation.properties.visibility / 1000) + ' km' : '-'}`}</IonCol>
        </IonRow>
      </IonGrid>
    </IonGrid>
  );
};

export default ObservationPopupContent;
