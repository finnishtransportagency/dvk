import React from 'react';
import { IonRow, IonCol, IonText, IonIcon, IonButton } from '@ionic/react';
import { FeatureLike } from 'ol/Feature';
import { useTranslation } from 'react-i18next';
import { Lang } from '../../utils/constants';
import { MarineWarningFeatureProperties } from '../features';
import marineWarningIcon from '../../theme/img/merivaroitus_ikoni_plain.svg';
import closeIcon from '../../theme/img/close_black_24dp.svg';

interface CoastalWarningItemProps {
  feature: FeatureLike;
  closePopup: () => void;
}

export const CoastalWarningItem: React.FC<CoastalWarningItemProps> = ({ feature, closePopup }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage as Lang;
  const properties = feature.getProperties() as MarineWarningFeatureProperties;

  return (
    <IonRow>
      <IonCol size="auto" className="ion-align-self-center">
        <IonIcon className="infoIcon" icon={marineWarningIcon} />
      </IonCol>
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
      <IonCol size="auto">
        <IonButton
          onClick={() => closePopup()}
          fill="clear"
          className="closeButton ion-no-padding"
          title={t('common.close-dialog')}
          aria-label={t('common.close-dialog')}
        >
          <IonIcon className="otherIconLarge" src={closeIcon} />
        </IonButton>
      </IonCol>
    </IonRow>
  );
};
