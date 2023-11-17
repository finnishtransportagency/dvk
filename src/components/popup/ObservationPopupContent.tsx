import React from 'react';
import { IonCol, IonGrid, IonRow } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import './popup.css';
import { coordinatesToStringHDM } from '../../utils/coordinateUtils';
import { ObservationFeatureProperties } from '../features';
import { PopupProperties } from '../mapOverlays/MapOverlays';
import { InfoParagraph } from '../content/Paragraph';
import { deselectClickSelection } from './popup';
import CloseButton from './CloseButton';

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
    deselectClickSelection();
  };

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
        <IonCol>
          {Math.round(observation.properties.windSpeedAvg)}{' '}
          <span aria-label={t('fairwayCards.unit.msDesc', { count: Math.round(observation.properties.windSpeedAvg || 0) })} role="definition">
            m/s
          </span>
          , {Math.round(observation.properties.windDirection)}{' '}
          <span aria-label={t('fairwayCards.unit.degDesc', { count: Math.round(observation.properties.windDirection || 0) })} role="definition">
            °
          </span>
        </IonCol>
      </IonRow>
      <IonRow>
        <IonCol className="header">{t('popup.observation.windSpeedMax')}</IonCol>
      </IonRow>
      <IonRow>
        <IonCol>
          {Math.round(observation.properties.windSpeedMax)}{' '}
          <span aria-label={t('fairwayCards.unit.msDesc', { count: Math.round(observation.properties.windSpeedMax || 0) })} role="definition">
            m/s
          </span>
        </IonCol>
      </IonRow>
      <IonRow>
        <IonCol className="header">{t('popup.observation.temperature')}</IonCol>
      </IonRow>
      <IonRow>
        <IonCol>
          {Math.round(observation.properties.temperature)}{' '}
          <span
            aria-label={t('fairwayCards.unit.degDesc', { count: Math.round(observation.properties.temperature || 0) }) + ' (Celsius)'}
            role="definition"
          >
            °C
          </span>
        </IonCol>
      </IonRow>
      <IonRow>
        <IonCol className="header">{t('popup.observation.visibility')}</IonCol>
      </IonRow>
      <IonRow>
        <IonCol>
          {(observation.properties.visibility !== null && (
            <>
              {Math.round((observation.properties.visibility || 0) / 1000)}{' '}
              <span
                aria-label={t('fairwayCards.unit.kmDesc', { count: Math.round((observation.properties.visibility || 0) / 1000) })}
                role="definition"
              >
                km
              </span>
            </>
          )) || <InfoParagraph title={t('common.noData')} />}
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};

export default ObservationPopupContent;
