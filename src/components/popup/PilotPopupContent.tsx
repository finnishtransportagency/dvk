import React from 'react';
import { IonCol, IonContent, IonGrid, IonRow } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { Text } from '../../graphql/generated';
import './PilotPopupContent.css';

type PilotPopupContentProps = {
  pilotPlace?: PilotProperties;
};

export type PilotProperties = {
  name: string;
  email?: string;
  phoneNumber?: string;
  fax?: string;
  internet?: string;
  journey?: number;
  extraInfo: Text;
};

const PilotPopupContent: React.FC<PilotPopupContentProps> = ({ pilotPlace }) => {
  const { t, i18n } = useTranslation('', { keyPrefix: 'popup.pilotPlace' });
  const lang = i18n.resolvedLanguage as 'fi' | 'sv' | 'en';
  return (
    <IonContent id="pilotPopupContent" class="ion-padding">
      <IonGrid class="ion-no-padding">
        <IonRow>
          <IonCol className="header">{t('header', { val: pilotPlace?.name })}</IonCol>
        </IonRow>
        {pilotPlace?.email && (
          <>
            <IonRow>
              <IonCol className="header">{t('email')}</IonCol>
            </IonRow>
            <IonRow>
              <IonCol>{pilotPlace?.email}</IonCol>
            </IonRow>
          </>
        )}
        {pilotPlace?.phoneNumber && (
          <>
            <IonRow>
              <IonCol className="header">{t('phoneNumber')}</IonCol>
            </IonRow>
            <IonRow>
              <IonCol>{pilotPlace?.phoneNumber}</IonCol>
            </IonRow>
          </>
        )}
        {pilotPlace?.fax && (
          <>
            <IonRow>
              <IonCol className="header">{t('fax')}</IonCol>
            </IonRow>
            <IonRow>
              <IonCol>{pilotPlace?.fax}</IonCol>
            </IonRow>
          </>
        )}
        {pilotPlace?.internet && (
          <>
            <IonRow>
              <IonCol className="header">{t('internet')}</IonCol>
            </IonRow>
            <IonRow>
              <IonCol>{pilotPlace?.internet}</IonCol>
            </IonRow>
          </>
        )}
        {pilotPlace?.journey && (
          <>
            <IonRow>
              <IonCol className="header">{t('journey')}</IonCol>
            </IonRow>
            <IonRow>
              <IonCol>{pilotPlace?.journey} mpk</IonCol>
            </IonRow>
          </>
        )}
        {pilotPlace?.extraInfo[lang] && (
          <>
            <IonRow>
              <IonCol className="header">{t('extra')}</IonCol>
            </IonRow>
            <IonRow>
              <IonCol>{pilotPlace?.extraInfo[lang]}</IonCol>
            </IonRow>
          </>
        )}
      </IonGrid>
    </IonContent>
  );
};

export default PilotPopupContent;
