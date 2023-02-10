import React from 'react';
import { IonButton, IonCol, IonGrid, IonIcon, IonRow } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import './popup.css';
import { coordinatesToStringHDM } from '../../utils/CoordinateUtils';
import { BuoyFeatureProperties } from '../features';
import { PopupProperties } from '../mapOverlays/MapOverlays';
import { InfoParagraph } from '../content/Paragraph';

type BuoyPopupContentProps = {
  buoy: BuoyProperties;
  setPopupProperties?: (properties: PopupProperties) => void;
};

export type BuoyProperties = {
  coordinates: number[];
  properties: BuoyFeatureProperties;
};

const BuoyPopupContent: React.FC<BuoyPopupContentProps> = ({ buoy, setPopupProperties }) => {
  const { t } = useTranslation();

  const closePopup = () => {
    if (setPopupProperties) setPopupProperties({});
  };

  return (
    <IonGrid id="buoyPopupContent" class="ion-padding">
      <IonGrid class="ion-no-padding">
        <IonRow className="ion-justify-content-between">
          <IonCol size="auto" className="header">
            {buoy.properties.name}
          </IonCol>
          <IonCol size="auto">
            <IonButton fill="clear" className="closeButton" onClick={() => closePopup()} title={t('common.close')} aria-label={t('common.close')}>
              <IonIcon className="otherIconLarge" src="assets/icon/close_black_24dp.svg" />
            </IonButton>
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol className="header">{t('popup.buoy.coordinates')}</IonCol>
        </IonRow>
        <IonRow>
          <IonCol>{coordinatesToStringHDM(buoy.coordinates) || <InfoParagraph title={t('common.noData')} />}</IonCol>
        </IonRow>
        <IonRow>
          <IonCol className="header">{t('popup.buoy.dateTime')}</IonCol>
        </IonRow>
        <IonRow>
          <IonCol>{t('popup.buoy.dateTimeFormat', { val: buoy.properties.dateTime })}</IonCol>
        </IonRow>
        <IonRow>
          <IonCol className="header">{t('popup.buoy.waveHeightDir')}</IonCol>
        </IonRow>
        <IonRow>
          <IonCol>
            {((buoy.properties.waveHeight || buoy.properties.waveDirection) && (
              <>
                {buoy.properties.waveHeight ? buoy.properties.waveHeight.toLocaleString() : '-'}{' '}
                <span aria-label={t('fairwayCards.unit.mDesc', { count: Number(buoy.properties.waveHeight || 0) })} role="definition">
                  m
                </span>
                , {buoy.properties.waveDirection ? Math.round(buoy.properties.waveDirection) : '-'}{' '}
                <span
                  aria-label={t('fairwayCards.unit.degDesc', { count: Number(Math.round(buoy.properties.waveDirection || 0)) })}
                  role="definition"
                >
                  °
                </span>
              </>
            )) || <InfoParagraph title={t('common.noData')} />}
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol className="header">{t('popup.buoy.temperature')}</IonCol>
        </IonRow>
        <IonRow>
          <IonCol>
            {(typeof null === 'number' && (
              <>
                {Math.round(buoy.properties.temperature || 0)}{' '}
                <span
                  aria-label={t('fairwayCards.unit.degDesc', { count: Number(Math.round(buoy.properties.temperature || 0)) }) + ' (Celsius)'}
                  role="definition"
                >
                  °C
                </span>
              </>
            )) || <InfoParagraph title={t('common.noData')} />}
          </IonCol>
        </IonRow>
      </IonGrid>
    </IonGrid>
  );
};

export default BuoyPopupContent;
