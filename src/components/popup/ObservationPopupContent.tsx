import React from 'react';
import { IonCol, IonGrid, IonIcon, IonRow } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import './popup.css';
import { coordinatesToStringHDM } from '../../utils/coordinateUtils';
import { ObservationFeatureProperties } from '../features';
import { PopupProperties } from '../mapOverlays/MapOverlays';
import { InfoParagraph } from '../content/Paragraph';
import { clearClickSelectionFeatures } from './selectInteraction';
import CloseButton from './CloseButton';
import alertIcon from '../../theme/img/alert_icon.svg';
import { getTimeDifference } from '../../utils/common';
import { hourInMilliseconds } from '../../utils/constants';

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
    clearClickSelectionFeatures();
  };

  const isDataOutdated12Hours = getTimeDifference(observation.properties.dateTime) > hourInMilliseconds * 12;
  const isDataOutdated1Hour = getTimeDifference(observation.properties.dateTime) > hourInMilliseconds;

  return (
    <IonGrid className="ion-no-padding">
      <IonRow className="ion-justify-content-between">
        <IonCol size="auto" className="header">
          {observation.properties.name}
        </IonCol>
        <IonCol size="auto">
          <CloseButton close={closePopup} />
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
      <div className={isDataOutdated1Hour ? 'outdatedData' : ''}>
        <IonRow>
          <IonCol className="header">{t('popup.observation.dateTime')}</IonCol>
        </IonRow>
        <IonRow>
          <IonCol>{t('popup.observation.dateTimeFormat', { val: observation.properties.dateTime })}</IonCol>
        </IonRow>
      </div>
      <div className={isDataOutdated12Hours ? 'outdatedData' : ''}>
        <IonRow>
          <IonCol className="header">{t('popup.observation.windSpeedAvgDir')}</IonCol>
        </IonRow>
        <IonRow>
          <IonCol>
            {!isDataOutdated12Hours ? (
              <>
                {Math.round(observation.properties.windSpeedAvg)}{' '}
                <dd aria-label={t('fairwayCards.unit.msDesc', { count: Math.round(observation.properties.windSpeedAvg || 0) })}>m/s</dd>,{' '}
                {Math.round(observation.properties.windDirection)}{' '}
                <dd aria-label={t('fairwayCards.unit.degDesc', { count: Math.round(observation.properties.windDirection || 0) })}>°</dd>
              </>
            ) : (
              <>
                <IonIcon className="outdatedDataIcon" icon={alertIcon} />
                {t('popup.observation.outdatedData')}
              </>
            )}
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol className="header">{t('popup.observation.windSpeedMax')}</IonCol>
        </IonRow>
        <IonRow>
          <IonCol>
            {!isDataOutdated12Hours ? (
              <>
                {Math.round(observation.properties.windSpeedMax)}{' '}
                <dd aria-label={t('fairwayCards.unit.msDesc', { count: Math.round(observation.properties.windSpeedMax || 0) })}>m/s</dd>
              </>
            ) : (
              <>
                <IonIcon className="outdatedDataIcon" icon={alertIcon} />
                {t('popup.observation.outdatedData')}
              </>
            )}
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol className="header">{t('popup.observation.temperature')}</IonCol>
        </IonRow>
        <IonRow>
          <IonCol>
            {!isDataOutdated12Hours ? (
              <>
                {Math.round(observation.properties.temperature)}{' '}
                <dd aria-label={t('fairwayCards.unit.degDesc', { count: Math.round(observation.properties.temperature || 0) }) + ' (Celsius)'}>°C</dd>
              </>
            ) : (
              <>
                <IonIcon className="outdatedDataIcon" icon={alertIcon} />
                {t('popup.observation.outdatedData')}
              </>
            )}
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol className="header">{t('popup.observation.visibility')}</IonCol>
        </IonRow>
        <IonRow>
          <IonCol>
            {!isDataOutdated12Hours ? (
              <>
                {(observation.properties.visibility !== null && (
                  <>
                    {Math.round((observation.properties.visibility || 0) / 1000)}{' '}
                    <dd aria-label={t('fairwayCards.unit.kmDesc', { count: Math.round((observation.properties.visibility || 0) / 1000) })}>km</dd>
                  </>
                )) || <InfoParagraph title={t('common.noData')} />}
              </>
            ) : (
              <>
                <IonIcon className="outdatedDataIcon" icon={alertIcon} />
                {t('popup.observation.outdatedData')}
              </>
            )}
          </IonCol>
        </IonRow>
      </div>
    </IonGrid>
  );
};

export default ObservationPopupContent;
