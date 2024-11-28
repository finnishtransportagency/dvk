import React from 'react';
import { IonCol, IonGrid, IonRow } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { Lang } from '../../utils/constants';
import ForecastTable from '../ForecastTable';
import { useFeatureData } from '../../utils/dataLoader';
import { ForecastFeatureProperties } from '../features';
import { coordinatesToStringHDM } from '../../utils/coordinateUtils';
import { Feature } from 'ol';
import { Geometry, Point } from 'ol/geom';
import './Forecast.css';

type ForecastContentProps = {
  forecast: Feature<Geometry>;
};

export type ForecastProperties = {
  coordinates: number[];
  properties: ForecastFeatureProperties;
};

const ForecastContainer: React.FC<ForecastContentProps> = ({ forecast }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage as Lang;
  const { dataUpdatedAt } = useFeatureData('forecast');
  const properties = forecast.getProperties() as ForecastFeatureProperties;
  const coordinates = (forecast.getGeometry() as Point)?.getCoordinates();
  return (
    <IonGrid className="forecast ion-no-padding">
      <IonRow className="ion-justify-content-between">
        <IonCol size="auto" className="header">
          {properties.name?.[lang]}
        </IonCol>
      </IonRow>
      <IonRow>
        <IonCol>
          {t('forecast.forecastLocation') + ': '}
          {coordinates ? coordinatesToStringHDM(coordinates) : ''}
        </IonCol>
      </IonRow>
      <IonRow>
        <IonCol className="header">{t('forecast.updated')}</IonCol>
      </IonRow>
      <IonRow>
        <IonCol>{t('forecast.dateTimeFormat', { val: dataUpdatedAt })}</IonCol>
      </IonRow>
      <br />
      <IonRow>
        <ForecastTable forecastItems={properties.forecastItems} page={12} clear={true} />
      </IonRow>
      <br />
    </IonGrid>
  );
};

export default ForecastContainer;
