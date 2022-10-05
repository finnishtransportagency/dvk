import React from 'react';
import { IonCol, IonContent, IonGrid, IonRow } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import Map from 'ol/Map';
import Overlay from 'ol/Overlay';
import { Text } from '../../graphql/generated';

type PilotPopupContentProps = {
  pilotPlace?: PilotProperties;
};

export type PilotProperties = {
  email?: string;
  phoneNumber?: string;
  fax?: string;
  internet?: string;
  extraInfo: Text;
};

const PilotPopupContent: React.FC<PilotPopupContentProps> = ({ pilotPlace }) => {
  const { t, i18n } = useTranslation('', { keyPrefix: 'popup.pilotPlace' });
  const lang = i18n.resolvedLanguage as 'fi' | 'sv' | 'en';
  return (
    <IonContent class="ion-padding">
      <IonGrid>
        <IonRow>
          <IonCol>
            <b>{t('email')}</b>
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol>{pilotPlace?.email}</IonCol>
        </IonRow>
        <IonRow>
          <IonCol>
            <b>{t('phoneNumber')}</b>
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol>{pilotPlace?.phoneNumber}</IonCol>
        </IonRow>
        <IonRow>
          <IonCol>
            <b>{t('fax')}</b>
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol>{pilotPlace?.fax}</IonCol>
        </IonRow>
        <IonRow>
          <IonCol>
            <b>{t('internet')}</b>
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol>{pilotPlace?.internet}</IonCol>
        </IonRow>
        {pilotPlace?.extraInfo[lang] && (
          <>
            <IonRow>
              <IonCol>
                <b>{t('extra')}</b>
              </IonCol>
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function addPopup(map: Map, openPopover: (event: any, place: PilotProperties) => void) {
  const element = document.getElementById('popup') as HTMLElement;
  const popup = new Overlay({
    element: element,
    positioning: 'bottom-center',
    stopEvent: false,
  });
  map.addOverlay(popup);
  map.on('click', function (evt) {
    const feature = map.forEachFeatureAtPixel(evt.pixel, function (f) {
      return f;
    });
    if (!feature) {
      return;
    }
    if (feature.getProperties().type === 'pilot') {
      console.log('Feature:');
      console.dir(feature.getProperties());
      popup.setPosition(evt.coordinate);
      openPopover(evt.originalEvent, {
        email: feature.getProperties().email,
        phoneNumber: feature.getProperties().phoneNumber,
        fax: feature.getProperties().fax,
        internet: feature.getProperties().internet,
        extraInfo: {
          fi: feature.getProperties().extraInfoFI,
          sv: feature.getProperties().extraInfoSV,
          en: feature.getProperties().extraInfoEN,
        },
      });
    }
  });
}

export default PilotPopupContent;
