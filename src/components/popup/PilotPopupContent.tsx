import React from 'react';
import { IonCol, IonGrid, IonRow } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { Text } from '../../graphql/generated';
import './popup.css';
import { coordinatesToStringHDM } from '../../utils/CoordinateUtils';
import { Link } from 'react-router-dom';

type PilotPopupContentProps = {
  pilot?: PilotProperties;
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

const PilotPopupContent: React.FC<PilotPopupContentProps> = ({ pilot }) => {
  const { t, i18n } = useTranslation('', { keyPrefix: 'popup.pilotPlace' });
  const lang = i18n.resolvedLanguage as 'fi' | 'sv' | 'en';
  return (
    <IonGrid id="pilotPopupContent" class="ion-padding">
      <IonGrid class="ion-no-padding">
        <IonRow>
          <IonCol className="header">{t('header', { val: pilot?.properties.name })}</IonCol>
        </IonRow>
        <IonRow>
          <IonCol className="header">{t('coordinates')}</IonCol>
        </IonRow>
        {pilot?.coordinates && (
          <IonRow>
            <IonCol>{coordinatesToStringHDM(pilot.coordinates)}</IonCol>
          </IonRow>
        )}
        <IonRow>
          <IonCol className="header">{t('fairways')}</IonCol>
        </IonRow>
        {pilot?.properties.fairwayCards.map((card, index) => {
          return (
            <IonRow key={index}>
              <IonCol>
                <Link to={`/vaylakortit/${card.id}`}>{card.name[lang]}</Link>
              </IonCol>
            </IonRow>
          );
        })}
      </IonGrid>
    </IonGrid>
  );
};

export default PilotPopupContent;
