import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IonCol, IonGrid, IonRow } from '@ionic/react';
import { ForecastItem } from './features';
import './ForecastTable.css';

type ForecastTableProps = {
  forecastItems: ForecastItem[];
  page?: number;
  clear?: boolean;

  //Remove this when a solution is found in future ticket to fix scroll problem
  requiresScrolling?: boolean;
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
  let windColClass = 'ForecastColGreen';
  if (forecastItem.windSpeed >= 14) {
    windColClass = 'ForecastColYellow';
  }
  if (forecastItem.windSpeed > 20) {
    windColClass = 'ForecastColRed';
  }

  let windGustColClass = 'ForecastColGreen';
  if (forecastItem.windGust >= 17) {
    windGustColClass = 'ForecastColYellow';
  }

  let waveColClass = 'ForecastColGreen';
  if (forecastItem.waveHeight > 2.2) {
    waveColClass = 'ForecastColYellow';
  }
  if (forecastItem.waveHeight > 2.6) {
    waveColClass = 'ForecastColRed';
  }

  let visibilityColClass = 'ForecastColGreen';
  if (forecastItem.visibility < 4) {
    visibilityColClass = 'ForecastColYellow';
  }

  function getTimeString(date: Date) {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return (hours < 10 ? '0' : '') + hours + ':' + (minutes < 10 ? '0' : '') + minutes;
  }

  const leftAlign: string = ' ion-text-begin';

  return (
    <IonRow className="ForecastRow">
      <IonCol size="2">{getTimeString(new Date(forecastItem.dateTime))}</IonCol>
      <IonCol size="3" className={windColClass + leftAlign}>
        {Math.round(forecastItem.windSpeed)} m/s, {Math.round(forecastItem.windDirection)}&deg;
      </IonCol>
      <IonCol size="2" className={windGustColClass + leftAlign}>
        {Math.round(forecastItem.windGust)} m/s
      </IonCol>
      <IonCol size="3" className={waveColClass + leftAlign}>
        {(Math.round(forecastItem.waveHeight * 10) / 10).toFixed(1)} m, {Math.round(forecastItem.waveDirection)}&deg;
      </IonCol>
      <IonCol size="2" className={visibilityColClass + leftAlign}>
        {(Math.round(forecastItem.visibility * 10) / 10).toFixed(1)} km
      </IonCol>
    </IonRow>
  );
};

const ForecastTable: React.FC<ForecastTableProps> = ({ forecastItems, page, clear = false, requiresScrolling = false }) => {
  const { t } = useTranslation();
  const [startIndex, setStartIndex] = useState<number>(0);
  const pageSize = page ?? 8;

  /* Always show timezone offset of the first forecast item */
  let utcDiffStr = timezoneOffsetMinutesToString(new Date(forecastItems[startIndex].dateTime));

  /* If timezone offset of the last element is not the same as the first element, show also timezone offset of the last element */
  const endIndex = Math.min(startIndex + pageSize, forecastItems.length - 1);
  if (new Date(forecastItems[endIndex].dateTime).getTimezoneOffset() !== new Date(forecastItems[startIndex].dateTime).getTimezoneOffset()) {
    utcDiffStr += ', ' + timezoneOffsetMinutesToString(new Date(forecastItems[endIndex].dateTime));
  }

  let timeoutId: number;
  const showPreviousPage = () => {
    setStartIndex(startIndex >= pageSize ? startIndex - pageSize : 0);
    //Remove this when a solution is found in future ticket to fix scroll problem
    timeoutId = window.setTimeout(scroll, 1);
  };

  const showNextPage = () => {
    setStartIndex(startIndex + pageSize);
    //Remove this when a solution is found in future ticket to fix scroll problem
    timeoutId = window.setTimeout(scroll, 1);
  };

  const scroll = () => {
    //Remove this when a solution is found in future ticket to fix scroll problem
    if (requiresScrolling) {
      const anchor = document.querySelector('#bottom');
      anchor?.scrollIntoView({ behavior: 'smooth' });
    }
    window.clearTimeout(timeoutId);
  };

  const gridClassName = 'ForecastGrid' + ((clear ? ' clear' : '') + ' ion-no-padding');
  return (
    <>
      <IonGrid className={gridClassName}>
        <IonRow className="HeaderRow ion-justify-content-between">
          <IonCol size="2" className="header">
            {t('forecastTable.tableHeaders.time')}
            <br />
            <span>({utcDiffStr})</span>
          </IonCol>
          <IonCol size="3" className="header">
            {t('forecastTable.tableHeaders.wind')}
          </IonCol>
          <IonCol size="2" className="header">
            {t('forecastTable.tableHeaders.windGust')}
          </IonCol>
          <IonCol size="3" className="header">
            {t('forecastTable.tableHeaders.wave')}
          </IonCol>
          <IonCol size="2" className="header">
            {t('forecastTable.tableHeaders.visibility')}
          </IonCol>
        </IonRow>
        {forecastItems.length > 0 ? (
          forecastItems.slice(startIndex, startIndex + pageSize).map((item, index, items) => {
            const showDateRow =
              (index === 0 && new Date(items[0].dateTime).getDate() === new Date(items[items.length - 1].dateTime).getDate()) ||
              (index !== 0 && new Date(items[index].dateTime).getDate() !== new Date(items[index - 1].dateTime).getDate());
            return (
              <div key={item.dateTime}>
                {showDateRow && <ForecastTableDateRow forecastItem={item} />}
                <ForecastTableRow forecastItem={item} />
              </div>
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
              {t('forecastTable.previousPage')} {pageSize}
              {t('forecastTable.hours')}
            </button>
          </IonCol>
          <IonCol size="6">
            <button className="ChangePageButton ion-float-right" onClick={showNextPage} disabled={startIndex + pageSize >= forecastItems.length}>
              {t('forecastTable.nextPage')} {pageSize}
              {t('forecastTable.hours')}
            </button>
          </IonCol>
        </IonRow>
      </IonGrid>
      <div id="bottom" />
    </>
  );
};

export default ForecastTable;
