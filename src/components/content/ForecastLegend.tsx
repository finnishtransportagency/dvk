import React from 'react';
import { IonCol, IonRow } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import './Forecast.css';

const ForecastLegend: React.FC = () => {
  const { t } = useTranslation();
  return (
    <IonRow>
      <IonCol size="auto">
        <div className="legend">
          <div className="legend box green" />
        </div>
      </IonCol>
      <IonCol size="auto">
        <div className="legend text">{t('forecast.lowRisk')}</div>
      </IonCol>
      <IonCol size="auto">
        <div className="legend">
          <div className="legend box yellow" />
        </div>
      </IonCol>
      <div className="legend text">{t('forecast.mediumRisk')}</div>
      <IonCol size="auto">
        <div className="legend">
          <div className="legend box red" />
        </div>
      </IonCol>
      <div className="legend text">{t('forecast.elevatedRisk')}</div>
    </IonRow>
  );
};

export default ForecastLegend;
