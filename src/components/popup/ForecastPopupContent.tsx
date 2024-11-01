import React from 'react';
import { IonCol, IonGrid, IonRow } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { Lang } from '../../utils/constants';
import './popup.css';
import { coordinatesToStringHDM } from '../../utils/coordinateUtils';
import { ForecastFeatureProperties } from '../features';
import { PopupProperties } from '../mapOverlays/MapOverlays';
import { clearClickSelectionFeatures } from './selectInteraction';
import CloseButton from './CloseButton';
import ForecastTable from '../ForecastTable';
import { useFeatureData } from '../../utils/dataLoader';

type ForecastPopupContentProps = {
  forecast: ForecastProperties;
  setPopupProperties?: (properties: PopupProperties) => void;
};

export type ForecastProperties = {
  coordinates: number[];
  properties: ForecastFeatureProperties;
};

const ForecastPopupContent: React.FC<ForecastPopupContentProps> = ({ forecast, setPopupProperties }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage as Lang;
  const { dataUpdatedAt } = useFeatureData('forecast');

  const closePopup = () => {
    if (setPopupProperties) setPopupProperties({});
    clearClickSelectionFeatures();
  };

  return (
    <IonGrid className="ion-no-padding">
      <IonRow className="ion-justify-content-between">
        <IonCol size="auto" className="header">
          {forecast.properties.name?.[lang]}
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
      <IonRow>
        <IonCol className="header">{t('popup.forecast.extra')}</IonCol>
      </IonRow>
      <IonRow>
        <IonCol>{t('popup.forecast.extraContent')}</IonCol>
      </IonRow>
      <IonRow>
        <IonCol className="header">{t('popup.forecast.forecast2')}</IonCol>
      </IonRow>
      <IonRow>
        <IonCol>
          {t('popup.forecast.updated')} {t('popup.forecast.dateTimeFormat', { val: dataUpdatedAt })}
        </IonCol>
      </IonRow>
      <IonRow>
        <ForecastTable forecastItems={forecast.properties.forecastItems} />
      </IonRow>
    </IonGrid>
  );
};

export default ForecastPopupContent;
