import React from 'react';
import { IonCol, IonGrid, IonIcon, IonRow } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import './popup.css';
import { coordinatesToStringHDM } from '../../utils/coordinateUtils';
import { MareographFeatureProperties } from '../features';
import { PopupProperties } from '../mapOverlays/MapOverlays';
import { InfoParagraph } from '../content/Paragraph';
import { clearClickSelectionFeatures } from './selectInteraction';
import CloseButton from './CloseButton';
import alertIcon from '../../theme/img/alert_icon.svg';
import { getTimeDifference } from '../../utils/common';
import { hourInMilliseconds } from '../../utils/constants';

type MareographPopupContentProps = {
  mareograph: MareographProperties;
  setPopupProperties?: (properties: PopupProperties) => void;
};

export type MareographProperties = {
  coordinates: number[];
  properties: MareographFeatureProperties;
};

const MareographPopupContent: React.FC<MareographPopupContentProps> = ({ mareograph, setPopupProperties }) => {
  const { t } = useTranslation();

  const closePopup = () => {
    if (setPopupProperties) setPopupProperties({});
    clearClickSelectionFeatures();
  };

  const isDataOutdated12Hours = getTimeDifference(mareograph.properties.dateTime) > hourInMilliseconds * 12;
  const isDataOutdated1Hour = getTimeDifference(mareograph.properties.dateTime) > hourInMilliseconds;

  return (
    <IonGrid className="ion-no-padding">
      <IonRow className="ion-justify-content-between">
        <IonCol size="auto" className="header">
          {mareograph.properties.name}
        </IonCol>
        <IonCol size="auto">
          <CloseButton close={closePopup} />
        </IonCol>
      </IonRow>
      <IonRow>
        <IonCol>{mareograph.properties.calculated ? t('popup.mareograph.calculated') : t('popup.mareograph.mareograph')}</IonCol>
      </IonRow>
      <IonRow>
        <IonCol className="header">{t('popup.mareograph.coordinates')}</IonCol>
      </IonRow>
      <IonRow>
        <IonCol>{coordinatesToStringHDM(mareograph.coordinates) || <InfoParagraph title={t('common.noData')} />}</IonCol>
      </IonRow>
      <div className={isDataOutdated1Hour ? 'outdatedData' : ''}>
        <IonRow>
          <IonCol className="header">{t('popup.mareograph.dateTime')}</IonCol>
        </IonRow>
        <IonRow>
          <IonCol>{t('popup.mareograph.dateTimeFormat', { val: mareograph.properties.dateTime })}</IonCol>
        </IonRow>
      </div>
      <div className={isDataOutdated12Hours ? 'outdatedData' : ''}>
        <IonRow>
          <IonCol className="header">{t('popup.mareograph.seaLevel')}</IonCol>
        </IonRow>
        <IonRow>
          <IonCol>
            {!isDataOutdated12Hours ? (
              <>
                {mareograph.properties.waterLevel >= 0 ? '+' : ''}
                {Math.round(mareograph.properties.waterLevel / 10)}{' '}
                <dd aria-label={t('fairwayCards.unit.cmDesc', { count: Math.round((mareograph.properties.waterLevel || 0) / 10) })}>cm</dd>
              </>
            ) : (
              <>
                <IonIcon className="outdatedDataIcon" icon={alertIcon} />
                {t('popup.common.outdatedData')}
              </>
            )}
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol className="header">{t('popup.mareograph.n2000SeaLevel')}</IonCol>
        </IonRow>
        <IonRow>
          <IonCol>
            {!isDataOutdated12Hours ? (
              <>
                {mareograph.properties.n2000WaterLevel >= 0 ? '+' : ''}
                {Math.round(mareograph.properties.n2000WaterLevel / 10)}{' '}
                <dd aria-label={t('fairwayCards.unit.cmDesc', { count: Math.round((mareograph.properties.n2000WaterLevel || 0) / 10) })}>cm</dd>
              </>
            ) : (
              <>
                <IonIcon className="outdatedDataIcon" icon={alertIcon} />
                {t('popup.common.outdatedData')}
              </>
            )}
          </IonCol>
        </IonRow>
      </div>
    </IonGrid>
  );
};

export default MareographPopupContent;
