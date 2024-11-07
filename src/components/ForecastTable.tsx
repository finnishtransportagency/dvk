import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IonCol, IonGrid, IonRow } from '@ionic/react';
import { ForecastItem } from './features';
import './ForecastTable.css';

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

const ForecastTableDateRow: React.FC<ForecastRowProps> = ({ forecastItem }) => {
  const { t } = useTranslation();

  return (
    <IonRow className="DateRow">
      <IonCol size="12" className="ion-text-center">
        {t('forecastTable.dateRowFormat', { val: forecastItem.dateTime })}
      </IonCol>
    </IonRow>
  );
};

const ForecastTableRow: React.FC<ForecastRowProps> = ({ forecastItem }) => {
  const { t } = useTranslation();

  return (
    <IonRow className="ForecastRow">
      <IonCol size="2">{t('forecastTable.dateTimeFormat', { val: forecastItem.dateTime })}</IonCol>
      <IonCol size="4">
        {Math.round(forecastItem.windSpeed)} ({Math.round(forecastItem.windGust)}) m/s, {Math.round(forecastItem.windDirection)}&deg;
      </IonCol>
      <IonCol size="4">
        {(Math.round(forecastItem.waveHeight * 10) / 10).toFixed(1)} m, {Math.round(forecastItem.waveDirection)}&deg;
      </IonCol>
      <IonCol size="2">{Math.round(forecastItem.visibility)} km</IonCol>
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
    <IonGrid className="ForecastGrid ion-no-padding">
      <IonRow className="HeaderRow ion-justify-content-between">
        <IonCol size="2" className="header">
          {t('forecastTable.tableHeaders.time')}
          <br />
          <span className="ion-text-nowrap">({utcDiffStr})</span>
        </IonCol>
        <IonCol size="4" className="header">
          {t('forecastTable.tableHeaders.wind')}
        </IonCol>
        <IonCol size="4" className="header">
          {t('forecastTable.tableHeaders.wave')}
        </IonCol>
        <IonCol size="2" className="header">
          {t('forecastTable.tableHeaders.visibility')}
        </IonCol>
      </IonRow>
      {forecastItems.length > 0 ? (
        forecastItems.slice(startIndex, startIndex + pageSize).map((forecastItem, index, forecastItems) => {
          const showDateRow =
            index === 0 || new Date(forecastItems[index].dateTime).getDate() !== new Date(forecastItems[index - 1].dateTime).getDate();
          return (
            <>
              {showDateRow && <ForecastTableDateRow forecastItem={forecastItem} />}
              <ForecastTableRow key={forecastItem.dateTime} forecastItem={forecastItem} />
            </>
          );
        })
      ) : (
        <IonRow>
          <IonCol>-</IonCol>
        </IonRow>
      )}
      <IonRow>
        <IonCol size="6">
          <button className="ChangePageButton" onClick={showPreviousPage} disabled={startIndex === 0}>
            {t('forecastTable.previousPage')} {pageSize}h
          </button>
        </IonCol>
        <IonCol size="6">
          <button className="ChangePageButton ion-float-right" onClick={showNextPage} disabled={startIndex + pageSize >= forecastItems.length}>
            {t('forecastTable.nextPage')} {pageSize}h
          </button>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};

export default ForecastTable;
