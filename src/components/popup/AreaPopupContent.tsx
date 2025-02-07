import React from 'react';
import { IonCol, IonGrid, IonRow } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import './popup.css';
import { AreaFeatureProperties, isShowN2000HeightSystem } from '../features';
import InfoIcon from '../../theme/img/info.svg?react';
import { PopupProperties } from '../mapOverlays/MapOverlays';
import { clearClickSelectionFeatures } from './selectInteraction';
import { getFairwayListFairwayCards } from '../../utils/fairwayCardUtils';
import { useFairwayCardListData } from '../../utils/dataLoader';
import { TFunction } from 'i18next';
import AreaPopupLink from './AreaPopupLink';
import AreaPopupFairways from './AreaPopupFairways';

type AreaPopupContentProps = {
  area: AreaProperties;
  setPopupProperties?: (properties: PopupProperties) => void;
};

export type AreaProperties = { coordinates: number[]; properties: AreaFeatureProperties };

function getAreaName(area: AreaProperties, t: TFunction) {
  const name = area.properties.name;
  const type = t('fairwayCards.areaType' + area.properties.typeCode);
  // ankkurointialueet pitkässä muodossa esim. osa 'c' -> 'ankkurointialue c'
  if (area.properties.typeCode == 2) {
    return name ? type + ' ' + name : type;
  }
  return name ?? type;
}

const getSizingSpeeds = (area: AreaProperties) => {
  return [
    ...Array.from(
      new Set(
        area?.properties.fairways
          ?.flatMap((fairway) => [fairway.sizingSpeed?.toLocaleString(), fairway.sizingSpeed2?.toLocaleString()])
          .filter((val) => val)
      )
    ),
  ];
};

const getSpeedLimits = (area: AreaProperties) => {
  return Array.from(
    new Set((Array.isArray(area.properties.speedLimit) ? area.properties.speedLimit : [area.properties.speedLimit ?? 0]).filter((val) => val > 0))
  ).sort((a, b) => a - b);
};

const AreaPopupContent: React.FC<AreaPopupContentProps> = ({ area, setPopupProperties }) => {
  const { t } = useTranslation();
  const { data } = useFairwayCardListData();
  const sizingSpeeds = getSizingSpeeds(area);
  const speedLimits = getSpeedLimits(area);
  const showN2000HeightSystem = isShowN2000HeightSystem(area.properties);
  const fairwayCards = data ? getFairwayListFairwayCards(area.properties.fairways ?? [], data.fairwayCards) : [];
  const showReferenceLevel = area.properties.depth ?? area.properties.draft ?? area.properties.n2000depth ?? area.properties.n2000draft;
  const showAreaInfo =
    area.properties.n2000draft ??
    area.properties.draft ??
    area.properties.n2000depth ??
    area.properties.depth ??
    (speedLimits.length > 0 || sizingSpeeds.length > 0);
  const showDraft = area.properties.n2000draft ?? area.properties.draft;
  const showDepth = area.properties.n2000depth ?? area.properties.depth;
  const closePopup = () => {
    if (setPopupProperties) setPopupProperties({});
    clearClickSelectionFeatures();
  };

  return (
    <IonGrid className="ion-no-padding">
      <AreaPopupFairways fairways={area.properties.fairways ?? []} closePopup={closePopup} />
      {showReferenceLevel && (
        <IonRow>
          <IonCol>
            <em>
              {showN2000HeightSystem ? (area.properties.n2000ReferenceLevel ?? area.properties.referenceLevel) : area.properties.referenceLevel}
            </em>
          </IonCol>
        </IonRow>
      )}
      <IonRow>
        <IonCol size="auto">{getAreaName(area, t)}</IonCol>
      </IonRow>
      {showAreaInfo && (
        <IonRow>
          <IonCol className="header">{t('popup.area.info')}</IonCol>
        </IonRow>
      )}
      {showDraft && (
        <IonRow>
          <IonCol>
            {t('popup.area.draft', { val: showN2000HeightSystem ? (area.properties.n2000draft ?? area.properties.draft) : area.properties.draft })}{' '}
            <dd
              aria-label={t('fairwayCards.unit.mDesc', {
                count: showN2000HeightSystem ? (area.properties.n2000draft ?? area.properties.draft) : area.properties.draft,
              })}
            >
              m
            </dd>
          </IonCol>
        </IonRow>
      )}
      {showDepth && (
        <IonRow>
          <IonCol>
            {t('popup.area.depth', { val: showN2000HeightSystem ? (area.properties.n2000depth ?? area.properties.depth) : area.properties.depth })}{' '}
            <dd
              aria-label={t('fairwayCards.unit.mDesc', {
                count: showN2000HeightSystem ? (area.properties.n2000depth ?? area.properties.depth) : area.properties.depth,
              })}
            >
              m
            </dd>
          </IonCol>
        </IonRow>
      )}
      {speedLimits.length > 0 && (
        <IonRow>
          <IonCol>
            {t('popup.area.speedLimit', { val: speedLimits.join(' / ') })} <dd aria-label={t('fairwayCards.unit.kmhDesc', { count: 0 })}>km/h</dd>
          </IonCol>
        </IonRow>
      )}
      {sizingSpeeds.length > 0 && (
        <IonRow>
          <IonCol>
            {t('popup.area.speed')} {sizingSpeeds.join(' / ')} <dd aria-label={t('fairwayCards.unit.ktsDesc', { count: 0 })}>kts</dd>
          </IonCol>
        </IonRow>
      )}
      <IonRow>
        <IonCol className="header">{t('popup.area.fairways')}</IonCol>
      </IonRow>
      {fairwayCards.length > 0 ? (
        fairwayCards.map((card) => {
          return <AreaPopupLink card={card} key={card.id} />;
        })
      ) : (
        <IonRow>
          <IonCol>
            <p className="info use-flex ion-align-items-center">
              <InfoIcon />
              {t('popup.common.noFairwayCards')}
            </p>
          </IonCol>
        </IonRow>
      )}
    </IonGrid>
  );
};

export default AreaPopupContent;
