import React from 'react';
import { IonCol, IonGrid, IonRow } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import './popup.css';
import { Link } from 'react-router-dom';
import { Lang, MASTERSGUIDE_URLS } from '../../utils/constants';
import { AreaFeatureProperties } from '../features';
import { Text } from '../../graphql/generated';
import InfoIcon from '../../theme/img/info.svg?react';
import { isShowN2000HeightSystem } from '../layerStyles/depthStyles';
import { PopupProperties } from '../mapOverlays/MapOverlays';
import { deselectClickSelection } from './popup';
import CloseButton from './CloseButton';

type AreaPopupContentProps = {
  area: AreaProperties;
  setPopupProperties?: (properties: PopupProperties) => void;
  isOffline: boolean;
};

export type AreaProperties = {
  coordinates: number[];
  properties: AreaFeatureProperties;
};

type FairwayCardIdName = {
  id: string;
  name: Text;
};

const AreaPopupContent: React.FC<AreaPopupContentProps> = ({ area, setPopupProperties, isOffline }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage as Lang;

  let fairwayCards: FairwayCardIdName[] = [];
  area.properties?.fairways?.forEach((f) => {
    if (f.fairwayCards) {
      fairwayCards.push(...f.fairwayCards);
    }
  });
  fairwayCards = fairwayCards.filter((card, index, self) => self.findIndex((inner) => inner?.id === card?.id) === index);

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

  const closePopup = () => {
    if (setPopupProperties) setPopupProperties({});
    deselectClickSelection();
  };

  return (
    <IonGrid id="areaPopupContent" className="ion-padding">
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
                {showN2000HeightSystem ? area.properties.n2000ReferenceLevel ?? area.properties.referenceLevel : area.properties.referenceLevel}
              </em>
            </IonCol>
          </IonRow>
        )}
        <IonRow>
          <IonCol size="auto">{area.properties.name ?? t('fairwayCards.areaType' + area.properties.typeCode)}</IonCol>
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
              {t('popup.area.draft', { val: showN2000HeightSystem ? area.properties.n2000draft ?? area.properties.draft : area.properties.draft })}{' '}
              <span
                aria-label={t('fairwayCards.unit.mDesc', {
                  count: showN2000HeightSystem ? area.properties.n2000draft ?? area.properties.draft : area.properties.draft,
                })}
                role="definition"
              >
                m
              </span>
            </IonCol>
          </IonRow>
        )}
        {(area.properties.n2000depth || area.properties.depth) && (
          <IonRow>
            <IonCol>
              {t('popup.area.depth', { val: showN2000HeightSystem ? area.properties.n2000depth ?? area.properties.depth : area.properties.depth })}{' '}
              <span
                aria-label={t('fairwayCards.unit.mDesc', {
                  count: showN2000HeightSystem ? area.properties.n2000depth ?? area.properties.depth : area.properties.depth,
                })}
                role="definition"
              >
                m
              </span>
            </IonCol>
          </IonRow>
        )}
        {speedLimits.length > 0 && (
          <IonRow>
            <IonCol>
              {t('popup.area.speedLimit', { val: speedLimits.join(' / ') })}{' '}
              <span aria-label={t('fairwayCards.unit.kmhDesc', { count: 0 })} role="definition">
                km/h
              </span>
            </IonCol>
          </IonRow>
        )}
        {sizingSpeeds.length > 0 && (
          <IonRow>
            <IonCol>
              {t('popup.area.speed')} {sizingSpeeds.join(' / ')}{' '}
              <span aria-label={t('fairwayCards.unit.ktsDesc', { count: 0 })} role="definition">
                kts
              </span>
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
                  <Link to={`/kortit/${card.id}`}>{card.name[lang]}</Link>
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
                  .
                </>
              </IonCol>
            </IonRow>
          </>
        )}
      </IonGrid>
    </IonGrid>
  );
};

export default AreaPopupContent;
