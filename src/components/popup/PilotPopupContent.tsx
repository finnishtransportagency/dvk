import React from 'react';
import { IonCol, IonGrid, IonRow } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { Text } from '../../graphql/generated';
import './popup.css';
import { coordinatesToStringHDM } from '../../utils/CoordinateUtils';

type PilotPopupContentProps = {
  pilotPlace?: PilotProperties;
};

type Card = {
  id: string;
  name: Text;
};

export type PilotFeatureProperties = {
  name: string;
  fairwayCards: Card[];
};

export type PilotProperties = {
  coordinates: number[];
  properties: PilotFeatureProperties;
};

const PilotPopupContent: React.FC<PilotPopupContentProps> = ({ pilotPlace }) => {
  const { t, i18n } = useTranslation('', { keyPrefix: 'popup.pilotPlace' });
  const lang = i18n.resolvedLanguage as 'fi' | 'sv' | 'en';
  return (
    <IonGrid id="pilotPopupContent" class="ion-padding">
      <IonGrid class="ion-no-padding">
        <IonRow>
          <IonCol className="header">{t('header', { val: pilotPlace?.properties.name })}</IonCol>
        </IonRow>
        <IonRow>
          <IonCol className="header">{t('coordinates')}</IonCol>
        </IonRow>
        {pilotPlace?.coordinates && (
          <IonRow>
            <IonCol>{coordinatesToStringHDM(pilotPlace.coordinates)}</IonCol>
          </IonRow>
        )}
        <IonRow>
          <IonCol className="header">{t('fairways')}</IonCol>
        </IonRow>
        {pilotPlace?.properties.fairwayCards.map((card, index) => {
          return (
            <IonRow key={index}>
              <IonCol>
                <a href={`/vaylakortit/${card.id}`}>{card.name[lang]}</a>
              </IonCol>
            </IonRow>
          );
        })}
      </IonGrid>
    </IonGrid>
  );
};

export default PilotPopupContent;
