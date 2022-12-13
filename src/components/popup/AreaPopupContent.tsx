import React from 'react';
import { IonCol, IonGrid, IonRow } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import './popup.css';
import { Link } from 'react-router-dom';
import { Lang } from '../../utils/constants';
import { AreaFeatureProperties } from '../features';
import { Text } from '../../graphql/generated';

type AreaPopupContentProps = {
  area: AreaProperties;
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
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage as Lang;
  const fairwayCards: FairwayCardIdName[] = [];
  area.properties?.fairways?.forEach((f) => {
    if (f.fairwayCards) {
      fairwayCards.push(...f.fairwayCards);
    }
  });
  const sizingSpeeds = [
    ...Array.from(
      new Set(
        area?.properties.fairways
          ?.flatMap((fairway) => [fairway.sizingSpeed?.toLocaleString(), fairway.sizingSpeed2?.toLocaleString()])
          .filter((val) => val)
      )
    ),
  ];
  return (
    <IonGrid id="areaPopupContent" class="ion-padding">
      <IonGrid class="ion-no-padding">
        {area.properties.name && (
          <IonRow>
            <IonCol className="header">{area.properties.name}</IonCol>
          </IonRow>
        )}
        {area.properties.n2000depth && (
          <IonRow>
            <IonCol>{area.properties.n2000ReferenceLevel}</IonCol>
          </IonRow>
        )}
        {!area.properties.n2000depth && area.properties.depth && (
          <IonRow>
            <IonCol>{area.properties.referenceLevel}</IonCol>
          </IonRow>
        )}
        {area.properties.typeCode === 15 && (
          <IonRow>
            <IonCol>{t('popup.area.overtake')}</IonCol>
          </IonRow>
        )}
        <IonRow>
          <IonCol className="header">{t('popup.area.info')}</IonCol>
        </IonRow>
        {(area.properties.n2000depth || area.properties.depth) && (
          <IonRow>
            <IonCol>{t('popup.area.depth', { val: area.properties.n2000depth || area.properties.depth })}</IonCol>
          </IonRow>
        )}
        {(area.properties.n2000draft || area.properties.draft) && (
          <IonRow>
            <IonCol>{t('popup.area.draft', { val: area.properties.n2000draft || area.properties.draft })}</IonCol>
          </IonRow>
        )}
        {sizingSpeeds.length > 0 && (
          <IonRow>
            <IonCol>
              {t('popup.area.speed')} {sizingSpeeds.join(' / ')} {t('fairwayCards.unit.ktsDesc', { count: 0 })}
            </IonCol>
          </IonRow>
        )}
        {fairwayCards.length > 0 && (
          <IonRow>
            <IonCol className="header">{t('popup.area.fairways')}</IonCol>
          </IonRow>
        )}
        {fairwayCards?.map((card, index) => {
          return (
            <IonRow key={index}>
              <IonCol>
                <Link to={`/vaylakortit/${card.id}`}>{card.name[lang]}</Link>
              </IonCol>
            </IonRow>
          );
        })}
        {area.properties.extra && (
          <>
            <IonRow>
              <IonCol className="header">{t('popup.area.extra')}</IonCol>
            </IonRow>
            <IonRow>
              <IonCol>{area.properties.extra}</IonCol>
            </IonRow>
          </>
        )}
      </IonGrid>
    </IonGrid>
  );
};

export default AreaPopupContent;
