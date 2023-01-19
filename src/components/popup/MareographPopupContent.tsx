import React from 'react';
import { IonCol, IonGrid, IonRow } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import './popup.css';
import { coordinatesToStringHDM } from '../../utils/CoordinateUtils';
import { MareographFeatureProperties } from '../features';

type MareographPopupContentProps = {
  mareograph?: MareographProperties;
};

export type MareographProperties = {
  coordinates: number[];
  properties: MareographFeatureProperties;
};

const MareographPopupContent: React.FC<MareographPopupContentProps> = ({ mareograph }) => {
  const { t } = useTranslation('', { keyPrefix: 'popup.mareograph' });
  return (
    <IonGrid id="mareographPopupContent" class="ion-padding">
      <IonGrid class="ion-no-padding">
        <IonRow>
          <IonCol className="header">{mareograph?.properties.name}</IonCol>
        </IonRow>
        <IonRow>
          <IonCol>{t('mareograph')}</IonCol>
        </IonRow>
        <IonRow>
          <IonCol className="header">{t('coordinates')}</IonCol>
        </IonRow>
        {mareograph?.coordinates && (
          <IonRow>
            <IonCol>{coordinatesToStringHDM(mareograph.coordinates)}</IonCol>
          </IonRow>
        )}
        <IonRow>
          <IonCol className="header">{t('dateTime')}</IonCol>
        </IonRow>
        <IonRow>
          <IonCol>{t('dateTimeFormat', { val: mareograph?.properties.dateTime })}</IonCol>
        </IonRow>
      </IonGrid>
    </IonGrid>
  );
};

export default MareographPopupContent;
