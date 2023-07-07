import React from 'react';
import { IonRow, IonCol, IonText } from '@ionic/react';
import { FeatureLike } from 'ol/Feature';
import { useTranslation } from 'react-i18next';
import { Lang } from '../../utils/constants';
import { MarineWarningFeatureProperties } from '../features';

interface CoastalWarningItemProps {
  feature: FeatureLike;
}

export const CoastalWarningItem: React.FC<CoastalWarningItemProps> = ({ feature }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage as Lang;
  const properties = feature.getProperties() as MarineWarningFeatureProperties;

  return (
    <IonCol>
      <IonRow>
        <IonCol>
          <strong>
            {properties.area && (
              <IonText>
                {properties.area[lang] || properties.area.fi}
                {', '}
              </IonText>
            )}
            {properties.dateTime && (
              <IonText>
                {t('popup.marine.datetimeFormat', {
                  val: properties.dateTime,
                })}
              </IonText>
            )}
            {(properties.startDateTime || properties.endDateTime) && (
              <IonText>
                {properties.startDateTime &&
                  t('popup.marine.datetimeFormat', {
                    val: properties.startDateTime,
                  })}
                {' - '}
                {properties.endDateTime &&
                  t('popup.marine.datetimeFormat', {
                    val: properties.endDateTime,
                  })}
              </IonText>
            )}
          </strong>
        </IonCol>
      </IonRow>
      {properties.description && (
        <IonRow>
          <IonCol>{properties.description[lang] || properties.description.fi}</IonCol>
        </IonRow>
      )}
    </IonCol>
  );
};
