import React from 'react';
import { IonCol, IonGrid, IonRow } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import './popup.css';
import { Link } from 'react-router-dom';
import { Lang, MASTERSGUIDE_URLS } from '../../utils/constants';
import { AreaFeatureProperties } from '../features';
import InfoIcon from '../../theme/img/info.svg?react';
import { isShowN2000HeightSystem } from '../layerStyles/depthStyles';
import { PopupProperties } from '../mapOverlays/MapOverlays';
import { clearClickSelectionFeatures } from './selectInteraction';
import CloseButton from './CloseButton';
import { useDvkContext } from '../../hooks/dvkContext';
import { getFairwayListFairwayCards } from '../../utils/fairwayCardUtils';
import { useFairwayCardListData } from '../../utils/dataLoader';
import { TFunction } from 'i18next';

type AreaPopupContentProps = {
  area: AreaProperties;
  setPopupProperties?: (properties: PopupProperties) => void;
  isOffline: boolean;
};

export type AreaProperties = {
  coordinates: number[];
  properties: AreaFeatureProperties;
};

export function getAreaName(area: AreaProperties, t: TFunction) {
  const name = area.properties.name;
  const type = t('fairwayCards.areaType' + area.properties.typeCode);
  // ankkurointialueet pitkässä muodossa esim. osa 'c' -> 'ankkurointialue c'
  if (area.properties.typeCode == 2) {
    return name ? type + ' ' + name : type;
  }
  return name ?? type;
}

const AreaPopupContent: React.FC<AreaPopupContentProps> = ({ area, setPopupProperties, isOffline }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage as Lang;
  const { state } = useDvkContext();
  const { data } = useFairwayCardListData();

  const sizingSpeeds = [
    ...Array.from(
      new Set(
        area?.properties.fairways
          ?.flatMap((fairway) => [fairway.sizingSpeed?.toLocaleString(), fairway.sizingSpeed2?.toLocaleString()])
          .filter((val) => val)
      )
    ),
  ];
  const speedLimits = Array.from(
    new Set((Array.isArray(area.properties.speedLimit) ? area.properties.speedLimit : [area.properties.speedLimit ?? 0]).filter((val) => val > 0))
  ).sort((a, b) => a - b);
  const showN2000HeightSystem = isShowN2000HeightSystem(area.properties);

  const fairwayCards = data ? getFairwayListFairwayCards(area.properties.fairways ?? [], data.fairwayCards) : [];

  const closePopup = () => {
    if (setPopupProperties) setPopupProperties({});
    clearClickSelectionFeatures();
  };

  return (
    <IonGrid className="ion-no-padding">
      {area.properties.fairways?.map((fairway, index) => {
        return (
          <IonRow key={fairway.fairwayId} className="ion-justify-content-between">
            <IonCol size="auto" className="header">
              {fairway.name[lang] ?? fairway.name.fi} {fairway.fairwayId}
            </IonCol>
            {index === 0 && (
              <IonCol size="auto">
                <CloseButton close={closePopup} />
              </IonCol>
            )}
          </IonRow>
        );
      })}
      {(area.properties.depth || area.properties.draft || area.properties.n2000depth || area.properties.n2000draft) && (
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
      {area.properties.typeCode === 15 && (
        <IonRow>
          <IonCol>
            <p className="info use-flex ion-align-items-center">
              <InfoIcon />
              {t('popup.area.overtake')}
            </p>
          </IonCol>
        </IonRow>
      )}
      {(area.properties.n2000draft ||
        area.properties.draft ||
        area.properties.n2000depth ||
        area.properties.depth ||
        speedLimits.length > 0 ||
        sizingSpeeds.length > 0) && (
        <IonRow>
          <IonCol className="header">{t('popup.area.info')}</IonCol>
        </IonRow>
      )}
      {(area.properties.n2000draft || area.properties.draft) && (
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
      {(area.properties.n2000depth || area.properties.depth) && (
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
          return (
            <IonRow key={'cardlink' + card.id}>
              <IonCol>
                <Link to={`/kortit/${card.id}`} className={state.preview ? 'disableLink' : ''}>
                  {card.name[lang]}
                </Link>
              </IonCol>
            </IonRow>
          );
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
      {area.properties.typeCode === 15 && (
        <>
          <IonRow>
            <IonCol className="header">{t('popup.area.extra')}</IonCol>
          </IonRow>
          <IonRow>
            <IonCol>
              <>
                {t('popup.area.prohibitionText')}{' '}
                <a href={'//' + MASTERSGUIDE_URLS[lang]} target="_blank" rel="noreferrer" tabIndex={isOffline ? -1 : undefined}>
                  {MASTERSGUIDE_URLS[lang]}
                  <span className="screen-reader-only">{t('opens-in-a-new-tab')}</span>
                </a>
                {'.'}
              </>
            </IonCol>
          </IonRow>
        </>
      )}
    </IonGrid>
  );
};

export default AreaPopupContent;
