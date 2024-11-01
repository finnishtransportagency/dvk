import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IonCol, IonGrid, IonRow, IonButton } from '@ionic/react';
import { ForecastItem } from './features';

type ForecastTableProps = {
  forecastItems: ForecastItem[];
};

type ForecastRowProps = {
  forecastItem: ForecastItem;
};

const timezoneOffsetMinutesToString = (date: Date) => {
  const offsetMinutes = date.getTimezoneOffset();
  const diff = Math.abs(offsetMinutes);
  const h = Math.floor(diff / 60);
  const m = diff % 60;

  if (m < 1) {
    return 'UTC' + (offsetMinutes < 0 ? '+' : '-') + h;
  } else {
    return 'UTC' + (offsetMinutes < 0 ? '+' : '-') + (h < 10 ? '0' : '') + h + (m < 10 ? ':0' : ':') + m;
  }
};

const ForecastTableRow: React.FC<ForecastRowProps> = ({ forecastItem }) => {
  const { t } = useTranslation();

  return (
    <IonRow>
      <IonCol size="2">{t('forecastTable.dateTimeFormat', { val: forecastItem.dateTime })}</IonCol>
      <IonCol size="4">
        {Math.round(forecastItem.windSpeed)} ({Math.round(forecastItem.windGust)}) m/s, {Math.round(forecastItem.windDirection)}&deg;
      </IonCol>
      <IonCol size="3">
        {Math.round(forecastItem.waveHeight)}m, {Math.round(forecastItem.waveDirection)}&deg;
      </IonCol>
      <IonCol size="3">{Math.round(forecastItem.visibility)}km</IonCol>
    </IonRow>
  );
};

const ForecastTable: React.FC<ForecastTableProps> = ({ forecastItems }) => {
  const { t } = useTranslation();
  const [startIndex, setStartIndex] = useState<number>(0);
  const pageSize = 8;

  const utcDiffStr = timezoneOffsetMinutesToString(new Date());

  const showPreviousPage = () => {
    setStartIndex(startIndex >= pageSize ? startIndex - pageSize : 0);
  };

  const showNextPage = () => {
    setStartIndex(startIndex + pageSize);
  };

  return (
    <IonGrid className="ion-no-padding">
      <IonRow className="ion-justify-content-between">
        <IonCol size="2" className="header">
          {t('forecastTable.tableHeaders.time')}
          <br />
          <span className="ion-text-nowrap">({utcDiffStr})</span>
        </IonCol>
        <IonCol size="4" className="header">
          {t('forecastTable.tableHeaders.wind')}
        </IonCol>
        <IonCol size="3" className="header">
          {t('forecastTable.tableHeaders.wave')}
        </IonCol>
        <IonCol size="3" className="header">
          {t('forecastTable.tableHeaders.visibility')}
        </IonCol>
      </IonRow>
      {forecastItems.length > 0 ? (
        forecastItems.slice(startIndex, startIndex + pageSize).map((forecastItem) => {
          return <ForecastTableRow key={forecastItem.dateTime} forecastItem={forecastItem} />;
        })
      ) : (
        <IonRow>
          <IonCol>-</IonCol>
        </IonRow>
      )}
      <IonRow>
        <IonCol size="6">
          <IonButton onClick={showPreviousPage} disabled={startIndex === 0}>
            {t('forecastTable.previousPage')} ({pageSize})h
          </IonButton>
        </IonCol>
        <IonCol size="6">
          <IonButton onClick={showNextPage} disabled={startIndex + pageSize >= forecastItems.length}>
            {t('forecastTable.nextPage')} ({pageSize})h
          </IonButton>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};

export default ForecastTable;
