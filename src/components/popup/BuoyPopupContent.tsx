import React from 'react';
import { IonCol, IonGrid, IonIcon, IonRow } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import './popup.css';
import { coordinatesToStringHDM } from '../../utils/coordinateUtils';
import { BuoyFeatureProperties } from '../features';
import { PopupProperties } from '../mapOverlays/MapOverlays';
import { InfoParagraph } from '../content/Paragraph';
import { clearClickSelectionFeatures } from './selectInteraction';
import CloseButton from './CloseButton';
import { getTimeDifference } from '../../utils/common';
import alertIcon from '../../theme/img/alert_icon.svg';

type BuoyPopupContentProps = {
  buoy: BuoyProperties;
  setPopupProperties?: (properties: PopupProperties) => void;
};

export type BuoyProperties = {
  coordinates: number[];
  properties: BuoyFeatureProperties;
};

const hourInMilliseconds = 3600000;

const BuoyPopupContent: React.FC<BuoyPopupContentProps> = ({ buoy, setPopupProperties }) => {
  const { t } = useTranslation();

  const closePopup = () => {
    if (setPopupProperties) setPopupProperties({});
    clearClickSelectionFeatures();
  };

  return (
    <IonGrid className="ion-no-padding">
      <IonRow className="ion-justify-content-between">
        <IonCol size="auto" className="header">
          {buoy.properties.name}
        </IonCol>
        <IonCol size="auto">
          <CloseButton close={closePopup} />
        </IonCol>
      </IonRow>
      <IonRow>
        <IonCol className="header">{t('popup.buoy.coordinates')}</IonCol>
      </IonRow>
      <IonRow>
        <IonCol>{coordinatesToStringHDM(buoy.coordinates) || <InfoParagraph title={t('common.noData')} />}</IonCol>
      </IonRow>
      <div className={getTimeDifference(buoy.properties.dateTime) > hourInMilliseconds ? 'outdatedData' : ''}>
        <IonRow>
          <IonCol className="header">{t('popup.buoy.dateTime')}</IonCol>
        </IonRow>
        <IonRow>
          <IonCol>{t('popup.buoy.dateTimeFormat', { val: buoy.properties.dateTime })}</IonCol>
        </IonRow>
      </div>
      <div className={getTimeDifference(buoy.properties.dateTime) > hourInMilliseconds * 12 ? 'outdatedData' : ''}>
        <IonRow>
          <IonCol className="header">{t('popup.buoy.waveHeightDir')}</IonCol>
        </IonRow>
        <IonRow>
          <IonCol>
            {getTimeDifference(buoy.properties.dateTime) < hourInMilliseconds * 12 ? (
              <>
                {((buoy.properties.waveHeight || buoy.properties.waveDirection) && (
                  <>
                    {buoy.properties.waveHeight ? buoy.properties.waveHeight.toLocaleString() : '-'}{' '}
                    <dd aria-label={t('fairwayCards.unit.mDesc', { count: Number(buoy.properties.waveHeight ?? 0) })}>m</dd>,{' '}
                    {buoy.properties.waveDirection ? Math.round(buoy.properties.waveDirection) : '-'}{' '}
                    <dd aria-label={t('fairwayCards.unit.degDesc', { count: Number(Math.round(buoy.properties.waveDirection ?? 0)) })}>°</dd>
                  </>
                )) || <InfoParagraph title={t('common.noData')} />}
              </>
            ) : (
              <>
                <IonIcon className="outdatedDataIcon" icon={alertIcon} />
                {t('popup.buoy.outdatedData')}
              </>
            )}
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol className="header">{t('popup.buoy.temperature')}</IonCol>
        </IonRow>
        <IonRow>
          <IonCol>
            {getTimeDifference(buoy.properties.dateTime) < hourInMilliseconds * 12 ? (
              <>
                {(typeof buoy.properties.temperature === 'number' && (
                  <>
                    {Math.round(buoy.properties.temperature)}{' '}
                    <dd aria-label={t('fairwayCards.unit.degDesc', { count: Number(Math.round(buoy.properties.temperature)) }) + ' (Celsius)'}>°C</dd>
                  </>
                )) || <InfoParagraph title={t('common.noData')} />}
              </>
            ) : (
              <>
                <IonIcon className="outdatedDataIcon" icon={alertIcon} />
                {t('popup.buoy.outdatedData')}
              </>
            )}
          </IonCol>
        </IonRow>
      </div>
    </IonGrid>
  );
};

export default BuoyPopupContent;
