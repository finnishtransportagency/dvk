import React from 'react';
import { IonRow, IonCol, IonText } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { Lang } from '../../utils/constants';
import { MarineWarning } from '../../graphql/generated';

interface GeneralMarineWarningItemProps {
  marineWarning: MarineWarning;
}

export const GeneralMarineWarningItem: React.FC<GeneralMarineWarningItemProps> = ({ marineWarning }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage as Lang;

  return (
    <IonCol>
      <IonRow>
        <IonCol>
          <strong>
            {marineWarning.area && (
              <IonText>
                {marineWarning.area[lang] ?? marineWarning.area.fi}
                {', '}
              </IonText>
            )}
            {marineWarning.dateTime > 0 && (
              <IonText>
                {t('popup.marine.datetimeFormat', {
                  val: marineWarning.dateTime,
                })}
              </IonText>
            )}
          </strong>
        </IonCol>
      </IonRow>
      {marineWarning.description && (
        <IonRow>
          <IonCol>{marineWarning.description[lang] ?? marineWarning.description.fi}</IonCol>
        </IonRow>
      )}
    </IonCol>
  );
};
