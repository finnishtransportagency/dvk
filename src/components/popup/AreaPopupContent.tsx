import React from 'react';
import { IonCol, IonGrid, IonRow } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import './popup.css';
import { Link } from 'react-router-dom';
import { Lang } from '../../utils/constants';
import { AreaFeatureProperties } from '../features';
import { Text } from '../../graphql/generated';

type AreaPopupContentProps = {
  area?: AreaProperties;
};

export type AreaProperties = {
  coordinates: number[];
  properties: AreaFeatureProperties;
};

type FairwayCardIdName = {
  id: string;
  name: Text;
};

const AreaPopupContent: React.FC<AreaPopupContentProps> = ({ area }) => {
  const { t, i18n } = useTranslation('', { keyPrefix: 'popup.area' });
  const lang = i18n.resolvedLanguage as Lang;
  const fairwayCards: FairwayCardIdName[] = [];
  area?.properties?.fairways?.forEach((f) => {
    if (f.fairwayCards) {
      fairwayCards.push(...f.fairwayCards);
    }
  });
  return (
    <IonGrid id="areaPopupContent" class="ion-padding">
      <IonGrid class="ion-no-padding">
        <IonRow>
          <IonCol className="header">{t('header', { val: area?.properties.name })}</IonCol>
        </IonRow>
        <IonRow>
          <IonCol className="header">{t('fairways')}</IonCol>
        </IonRow>
        {fairwayCards?.map((card, index) => {
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

export default AreaPopupContent;
