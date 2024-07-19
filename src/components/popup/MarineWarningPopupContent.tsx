import React from 'react';
import { IonCol, IonGrid, IonRow } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import './popup.css';
import { Lang } from '../../utils/constants';
import { AreaFairway, LineFairway, MarineWarningFeatureProperties } from '../features';
import { getMap } from '../DvkMap';
import InfoIcon from '../../theme/img/info.svg?react';
import { PopupProperties } from '../mapOverlays/MapOverlays';
import { clearClickSelectionFeatures } from './selectInteraction';
import CloseButton from './CloseButton';
import { Feature } from 'ol';
import { Geometry } from 'ol/geom';

type MarineWarningPopupContentProps = {
  marine: MarineWarningProperties;
  setPopupProperties?: (properties: PopupProperties) => void;
};

export type MarineWarningProperties = {
  coordinates: number[];
  properties: MarineWarningFeatureProperties;
};

export type FairwayPopupRowProperties = {
  lang: Lang;
  fairway: LineFairway | AreaFairway;
};

const FairwayPopupRow: React.FC<FairwayPopupRowProperties> = ({ fairway, lang }) => {
  return (
    <IonRow>
      <IonCol>{fairway.name[lang] ?? fairway.name.fi}</IonCol>
    </IonRow>
  );
};

const MarineWarningPopupContent: React.FC<MarineWarningPopupContentProps> = ({ marine, setPopupProperties }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage as Lang;
  const dvkMap = getMap();

  const equipmentFeature = marine.properties.equipmentId
    ? ((dvkMap.getVectorSource('safetyequipment').getFeatureById(marine.properties.equipmentId) as Feature<Geometry>) ??
      (dvkMap.getVectorSource('safetyequipmentfault').getFeatureById(marine.properties.equipmentId) as Feature<Geometry>))
    : undefined;

  const closePopup = () => {
    if (setPopupProperties) setPopupProperties({});
    clearClickSelectionFeatures();
  };

  return (
    <IonGrid className="ion-no-padding">
      <IonRow className="ion-justify-content-between">
        <IonCol size="auto" className="header">
          {marine.properties.type && (marine.properties.type[lang] || marine.properties.type.fi)}
          {' - '}
          {marine.properties.number}
        </IonCol>
        <IonCol size="auto">
          <CloseButton close={closePopup} />
        </IonCol>
      </IonRow>
      {marine.properties.area && (
        <>
          <IonRow>
            <IonCol className="header">{t('popup.marine.area')}</IonCol>
          </IonRow>
          <IonRow>
            <IonCol>{marine.properties.area[lang] ?? marine.properties.area.fi}</IonCol>
          </IonRow>
        </>
      )}
      {marine.properties.location && (
        <>
          <IonRow>
            <IonCol className="header">{t('popup.marine.location')}</IonCol>
          </IonRow>
          <IonRow>
            <IonCol>{marine.properties.location[lang] ?? marine.properties.location.fi}</IonCol>
          </IonRow>
        </>
      )}
      {marine.properties.description && (
        <>
          <IonRow>
            <IonCol className="header">{t('popup.marine.description')}</IonCol>
          </IonRow>
          <IonRow>
            <IonCol>{marine.properties.description[lang] ?? marine.properties.description.fi}</IonCol>
          </IonRow>
        </>
      )}
      <IonRow>
        <IonCol className="header">{t('popup.marine.target')}</IonCol>
      </IonRow>
      {marine.properties.equipmentId && (
        <IonRow>
          <IonCol>
            {equipmentFeature?.getProperties().name[lang] || equipmentFeature?.getProperties().name.fi}
            {' - '}
            {marine.properties.equipmentId}
          </IonCol>
        </IonRow>
      )}
      {(dvkMap.getVectorSource('line12').getFeatureById(marine.properties.lineId ?? 0) as Feature<Geometry>)
        ?.getProperties()
        .fairways?.map((fairway: LineFairway) => {
          return <FairwayPopupRow key={fairway.fairwayId} fairway={fairway} lang={lang} />;
        })}
      {(dvkMap.getVectorSource('line3456').getFeatureById(marine.properties.lineId ?? 0) as Feature<Geometry>)
        ?.getProperties()
        .fairways?.map((fairway: LineFairway) => {
          return <FairwayPopupRow key={fairway.fairwayId} fairway={fairway} lang={lang} />;
        })}
      {(dvkMap.getVectorSource('area12').getFeatureById(marine.properties.areaId ?? 0) as Feature<Geometry>)
        ?.getProperties()
        .fairways?.map((fairway: AreaFairway) => {
          return <FairwayPopupRow key={fairway.fairwayId} fairway={fairway} lang={lang} />;
        })}
      {(dvkMap.getVectorSource('area3456').getFeatureById(marine.properties.areaId ?? 0) as Feature<Geometry>)
        ?.getProperties()
        .fairways?.map((fairway: AreaFairway) => {
          return <FairwayPopupRow key={fairway.fairwayId} fairway={fairway} lang={lang} />;
        })}
      {!marine.properties.areaId && !marine.properties.lineId && !marine.properties.equipmentId && (
        <IonRow>
          <IonCol>
            <p className="info use-flex ion-align-items-center">
              <InfoIcon />
              {t('popup.marine.notarget')}
            </p>
          </IonCol>
        </IonRow>
      )}
      {marine.properties.dateTime && (
        <>
          <IonRow>
            <IonCol className="header">{t('popup.marine.datetime')}</IonCol>
          </IonRow>
          <IonRow>
            <IonCol>
              {t('popup.marine.datetimeFormat', {
                val: marine.properties.dateTime,
              })}
            </IonCol>
          </IonRow>
        </>
      )}
      {(marine.properties.startDateTime || marine.properties.endDateTime) && (
        <>
          <IonRow>
            <IonCol className="header">{t('popup.marine.startend')}</IonCol>
          </IonRow>
          <IonRow>
            <IonCol>
              {marine.properties.startDateTime &&
                t('popup.marine.datetimeFormat', {
                  val: marine.properties.startDateTime,
                })}
              {' - '}
              {marine.properties.endDateTime &&
                t('popup.marine.datetimeFormat', {
                  val: marine.properties.endDateTime,
                })}
            </IonCol>
          </IonRow>
        </>
      )}
      {marine.properties.notifier && (
        <>
          <IonRow>
            <IonCol className="header">{t('popup.marine.notifier')}</IonCol>
          </IonRow>
          <IonRow>
            <IonCol>{marine.properties.notifier}</IonCol>
          </IonRow>
        </>
      )}
    </IonGrid>
  );
};

export default MarineWarningPopupContent;
