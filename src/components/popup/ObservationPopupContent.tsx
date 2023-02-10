import React from 'react';
import { IonButton, IonCol, IonGrid, IonIcon, IonRow } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import './popup.css';
import { coordinatesToStringHDM } from '../../utils/CoordinateUtils';
import { ObservationFeatureProperties } from '../features';
import { PopupProperties } from '../mapOverlays/MapOverlays';

type ObservationPopupContentProps = {
  observation: ObservationProperties;
  setPopupProperties?: (properties: PopupProperties) => void;
};

export type ObservationProperties = {
  coordinates: number[];
  properties: ObservationFeatureProperties;
};

const ObservationPopupContent: React.FC<ObservationPopupContentProps> = ({ observation, setPopupProperties }) => {
  const { t } = useTranslation();

  const closePopup = () => {
    if (setPopupProperties) setPopupProperties({});
  };

  return (
    <IonGrid id="observationPopupContent" class="ion-padding">
      <IonGrid class="ion-no-padding">
        <IonRow className="ion-justify-content-between">
          <IonCol size="auto" className="header">
            {observation.properties.name}
          </IonCol>
          <IonCol size="auto">
            <IonButton fill="clear" className="closeButton" onClick={() => closePopup()} title={t('common.close')} aria-label={t('common.close')}>
              <IonIcon className="otherIconLarge" src="/assets/icon/close_black_24dp.svg" />
            </IonButton>
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol>{t('popup.observation.observation')}</IonCol>
        </IonRow>
        <IonRow>
          <IonCol className="header">{t('popup.observation.coordinates')}</IonCol>
        </IonRow>
        {observation.coordinates && (
          <IonRow>
            <IonCol>{coordinatesToStringHDM(observation.coordinates)}</IonCol>
          </IonRow>
        )}
        <IonRow>
          <IonCol className="header">{t('popup.observation.dateTime')}</IonCol>
        </IonRow>
        <IonRow>
          <IonCol>{t('popup.observation.dateTimeFormat', { val: observation.properties.dateTime })}</IonCol>
        </IonRow>
        <IonRow>
          <IonCol className="header">{t('popup.observation.windSpeedAvgDir')}</IonCol>
        </IonRow>
        <IonRow>
          <IonCol>{`${Math.round(observation.properties.windSpeedAvg)} m/s, ${Math.round(observation.properties.windDirection)} °`}</IonCol>
        </IonRow>
        <IonRow>
          <IonCol className="header">{t('popup.observation.windSpeedMax')}</IonCol>
        </IonRow>
        <IonRow>
          <IonCol>{`${Math.round(observation.properties.windSpeedMax)} m/s`}</IonCol>
        </IonRow>
        <IonRow>
          <IonCol className="header">{t('popup.observation.temperature')}</IonCol>
        </IonRow>
        <IonRow>
          <IonCol>{`${Math.round(observation.properties.temperature)} °C`}</IonCol>
        </IonRow>
        <IonRow>
          <IonCol className="header">{t('popup.observation.visibility')}</IonCol>
        </IonRow>
        <IonRow>
          <IonCol>{`${observation.properties.visibility ? Math.round(observation.properties.visibility / 1000) + ' km' : '-'}`}</IonCol>
        </IonRow>
      </IonGrid>
    </IonGrid>
  );
};

export default ObservationPopupContent;
