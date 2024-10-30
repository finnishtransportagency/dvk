import React from 'react';
import { IonCol, IonGrid, IonRow } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import './popup.css';
import { coordinatesToStringHDM } from '../../utils/coordinateUtils';
import { ForecastFeatureProperties } from '../features';
import { PopupProperties } from '../mapOverlays/MapOverlays';
import { clearClickSelectionFeatures } from './selectInteraction';
import CloseButton from './CloseButton';

type ForecastPopupContentProps = {
  forecast: ForecastProperties;
  setPopupProperties?: (properties: PopupProperties) => void;
};

export type ForecastProperties = {
  coordinates: number[];
  properties: ForecastFeatureProperties;
};

const ForecastPopupContent: React.FC<ForecastPopupContentProps> = ({ forecast, setPopupProperties }) => {
  const { t } = useTranslation();

  const closePopup = () => {
    if (setPopupProperties) setPopupProperties({});
    clearClickSelectionFeatures();
  };

  return (
    <IonGrid className="ion-no-padding">
      <IonRow className="ion-justify-content-between">
        <IonCol size="auto" className="header">
          {forecast.properties.pilotPlaceId}
        </IonCol>
        <IonCol size="auto">
          <CloseButton close={closePopup} />
        </IonCol>
      </IonRow>
      <IonRow>
        <IonCol>{t('popup.forecast.forecast')}</IonCol>
      </IonRow>
      <IonRow>
        <IonCol className="header">{t('popup.forecast.coordinates')}</IonCol>
      </IonRow>
      {forecast.coordinates && (
        <IonRow>
          <IonCol>{coordinatesToStringHDM(forecast.coordinates)}</IonCol>
        </IonRow>
      )}
    </IonGrid>
  );
};

export default ForecastPopupContent;
