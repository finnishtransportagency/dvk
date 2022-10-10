import React from 'react';
import { IonCol, IonContent, IonGrid, IonRow } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { Text } from '../../graphql/generated';
import './popup.css';
import { toStringHDMS } from 'ol/coordinate';

type PilotPopupContentProps = {
  pilotPlace?: PilotProperties;
};

export type PilotProperties = {
  coordinates: number[];
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
    <IonGrid id="pilotPopupContent" class="ion-padding">
      <IonGrid class="ion-no-padding">
        <IonRow>
          <IonCol className="header">{t('header', { val: pilotPlace?.name })}</IonCol>
        </IonRow>
        <IonRow>
          <IonCol className="header">{t('coordinates')}</IonCol>
        </IonRow>
        {pilotPlace?.coordinates && (
          <IonRow>
            <IonCol>{toStringHDMS(pilotPlace.coordinates)}</IonCol>
          </IonRow>
        )}
        <IonRow>
          <IonCol className="header">{t('contactDetails')}</IonCol>
        </IonRow>
        {pilotPlace?.email && (
          <IonRow>
            <IonCol>{t('email', { val: pilotPlace?.email })}</IonCol>
          </IonRow>
        )}
        {pilotPlace?.phoneNumber && (
          <IonRow>
            <IonCol>{t('phoneNumber', { val: pilotPlace?.phoneNumber })}</IonCol>
          </IonRow>
        )}
        {pilotPlace?.fax && (
          <IonRow>
            <IonCol>{t('fax', { val: pilotPlace?.fax })}</IonCol>
          </IonRow>
        )}
        {pilotPlace?.internet && (
          <IonRow>
            <IonCol>{t('internet', { val: pilotPlace?.internet })}</IonCol>
          </IonRow>
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
    </IonGrid>
  );
};

export default PilotPopupContent;
