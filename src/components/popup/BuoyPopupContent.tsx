import React from 'react';
import { IonCol, IonGrid, IonRow } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import './popup.css';
import { coordinatesToStringHDM } from '../../utils/CoordinateUtils';
import { BuoyFeatureProperties } from '../features';
import { PopupProperties } from '../mapOverlays/MapOverlays';
import { InfoParagraph } from '../content/Paragraph';
import { deselectClickSelection } from './popup';
import CloseButton from './CloseButton';

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
    deselectClickSelection();
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
              <span aria-label={t('fairwayCards.unit.mDesc', { count: Number(buoy.properties.waveHeight ?? 0) })} role="definition">
                m
              </span>
              , {buoy.properties.waveDirection ? Math.round(buoy.properties.waveDirection) : '-'}{' '}
              <span aria-label={t('fairwayCards.unit.degDesc', { count: Number(Math.round(buoy.properties.waveDirection ?? 0)) })} role="definition">
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
          {(typeof buoy.properties.temperature === 'number' && (
            <>
              {Math.round(buoy.properties.temperature)}{' '}
              <span
                aria-label={t('fairwayCards.unit.degDesc', { count: Number(Math.round(buoy.properties.temperature)) }) + ' (Celsius)'}
                role="definition"
              >
                °C
              </span>
            </>
          )) || <InfoParagraph title={t('common.noData')} />}
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};

export default BuoyPopupContent;
