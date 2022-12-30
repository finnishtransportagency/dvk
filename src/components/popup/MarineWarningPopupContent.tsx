import React from 'react';
import { IonCol, IonGrid, IonRow } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import './popup.css';
import { Lang } from '../../utils/constants';
import { AreaFairway, LineFairway, MarineWarningFeatureProperties } from '../features';
import { getMap } from '../DvkMap';
import { ReactComponent as InfoIcon } from '../../theme/img/info.svg';

type MarineWarningPopupContentProps = {
  marine: MarineWarningProperties;
};

export type MarineWarningProperties = {
  coordinates: number[];
  properties: MarineWarningFeatureProperties;
};

const MarineWarningPopupContent: React.FC<MarineWarningPopupContentProps> = ({ marine }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage as Lang;
  const dvkMap = getMap();
  return (
    <IonGrid id="marinePopupContent" className="ion-padding">
      <IonGrid className="ion-no-padding">
        {marine.properties.type && (
          <IonRow>
            <IonCol className="header">
              {marine.properties.type[lang] || marine.properties.type.fi}
              {' - '}
              {marine.properties.number}
            </IonCol>
          </IonRow>
        )}
        {marine.properties.area && (
          <>
            <IonRow>
              <IonCol className="header">{t('popup.marine.area')}</IonCol>
            </IonRow>
            <IonRow>
              <IonCol>{marine.properties.area[lang] || marine.properties.area.fi}</IonCol>
            </IonRow>
          </>
        )}
        {marine.properties.location && (
          <>
            <IonRow>
              <IonCol className="header">{t('popup.marine.location')}</IonCol>
            </IonRow>
            <IonRow>
              <IonCol>{marine.properties.location[lang] || marine.properties.location.fi}</IonCol>
            </IonRow>
          </>
        )}
        {marine.properties.description && (
          <>
            <IonRow>
              <IonCol className="header">{t('popup.marine.description')}</IonCol>
            </IonRow>
            <IonRow>
              <IonCol>{marine.properties.description[lang] || marine.properties.description.fi}</IonCol>
            </IonRow>
          </>
        )}
        <IonRow>
          <IonCol className="header">{t('popup.marine.target')}</IonCol>
        </IonRow>
        {marine.properties.equipmentId && (
          <IonRow>
            <IonCol>
              {dvkMap.getVectorSource('safetyequipment').getFeatureById(marine.properties.equipmentId)?.getProperties().name[lang] ||
                dvkMap.getVectorSource('safetyequipment').getFeatureById(marine.properties.equipmentId)?.getProperties().name.fi}
              {' - '}
              {marine.properties.equipmentId}
            </IonCol>
          </IonRow>
        )}
        {dvkMap
          .getVectorSource('line12')
          .getFeatureById(marine.properties.lineId || 0)
          ?.getProperties()
          .fairways?.map((fairway: LineFairway, index: number) => {
            return (
              <IonRow key={index}>
                <IonCol>{fairway.name[lang] || fairway.name.fi}</IonCol>
              </IonRow>
            );
          })}
        {dvkMap
          .getVectorSource('line3456')
          .getFeatureById(marine.properties.lineId || 0)
          ?.getProperties()
          .fairways?.map((fairway: LineFairway, index: number) => {
            return (
              <IonRow key={index}>
                <IonCol>{fairway.name[lang] || fairway.name.fi}</IonCol>
              </IonRow>
            );
          })}
        {dvkMap
          .getVectorSource('area12')
          .getFeatureById(marine.properties.areaId || 0)
          ?.getProperties()
          .fairways?.map((fairway: AreaFairway, index: number) => {
            return (
              <IonRow key={index}>
                <IonCol>{fairway.name[lang] || fairway.name.fi}</IonCol>
              </IonRow>
            );
          })}
        {dvkMap
          .getVectorSource('area3456')
          .getFeatureById(marine.properties.areaId || 0)
          ?.getProperties()
          .fairways?.map((fairway: AreaFairway, index: number) => {
            return (
              <IonRow key={index}>
                <IonCol>{fairway.name[lang] || fairway.name.fi}</IonCol>
              </IonRow>
            );
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
                {t('popup.marine.datetimeFormat2', {
                  val: marine.properties.startDateTime,
                  val2: marine.properties.endDateTime,
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
    </IonGrid>
  );
};

export default MarineWarningPopupContent;
