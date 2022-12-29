import React from 'react';
import { IonCol, IonGrid, IonRow } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import './popup.css';
import { Lang } from '../../utils/constants';
import { MarineWarningFeatureProperties } from '../features';

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
  return (
    <IonGrid id="marinePopupContent" class="ion-padding">
      <IonGrid class="ion-no-padding">
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
        {marine.properties.dateTime && (
          <>
            <IonRow>
              <IonCol className="header">{t('popup.marine.datetime')}</IonCol>
            </IonRow>
            <IonRow>
              <IonCol>
                {t('popup.equipment.datetimeFormat', {
                  val: marine.properties.dateTime,
                })}
              </IonCol>
            </IonRow>
          </>
        )}
      </IonGrid>
    </IonGrid>
  );
};

export default MarineWarningPopupContent;
