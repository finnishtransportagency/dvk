import React from 'react';
import { IonButton, IonCol, IonGrid, IonIcon, IonRow } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import './popup.css';
import { Link } from 'react-router-dom';
import { Lang, MASTERSGUIDE_URLS } from '../../utils/constants';
import { AreaFeatureProperties } from '../features';
import { Text } from '../../graphql/generated';
import { ReactComponent as InfoIcon } from '../../theme/img/info.svg';
import { isShowN2000HeightSystem } from '../layerStyles/depthStyles';
import { PopupProperties } from '../mapOverlays/MapOverlays';
import closeIcon from '../../theme/img/close_black_24dp.svg';

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
    new Set((Array.isArray(area.properties.speedLimit) ? area.properties.speedLimit : [area.properties.speedLimit || 0]).filter((val) => val > 0))
  ).sort((a, b) => a - b);
  const showN2000HeightSystem = isShowN2000HeightSystem(area.properties);

  const closePopup = () => {
    if (setPopupProperties) setPopupProperties({});
  };

  return (
    <IonGrid id="areaPopupContent" class="ion-padding">
      <IonGrid class="ion-no-padding">
        <IonRow className="ion-justify-content-between">
          <IonCol size="auto" className="header">
            {area.properties.name || t('fairwayCards.areaType' + area.properties.typeCode)} {area.properties.id}
          </IonCol>
          <IonCol size="auto">
            <IonButton fill="clear" className="closeButton" onClick={() => closePopup()} title={t('common.close')} aria-label={t('common.close')}>
              <IonIcon className="otherIconLarge" src={closeIcon} />
            </IonButton>
          </IonCol>
        </IonRow>
        {(area.properties.depth || area.properties.draft || area.properties.n2000depth || area.properties.n2000draft) && (
          <IonRow>
            <IonCol>
              <em>{showN2000HeightSystem ? 'N2000 (BSCD2000)' : 'MW'}</em>
            </IonCol>
          </IonRow>
        )}
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
        <IonRow>
          <IonCol className="header">{t('popup.area.info')}</IonCol>
        </IonRow>
        {(area.properties.n2000draft || area.properties.draft) && (
          <IonRow>
            <IonCol>
              {t('popup.area.draft', { val: showN2000HeightSystem ? area.properties.n2000draft || area.properties.draft : area.properties.draft })}{' '}
              <span
                aria-label={t('fairwayCards.unit.mDesc', {
                  count: showN2000HeightSystem ? area.properties.n2000draft || area.properties.draft : area.properties.draft,
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
              {t('popup.area.depth', { val: showN2000HeightSystem ? area.properties.n2000depth || area.properties.depth : area.properties.depth })}{' '}
              <span
                aria-label={t('fairwayCards.unit.mDesc', {
                  count: showN2000HeightSystem ? area.properties.n2000depth || area.properties.depth : area.properties.depth,
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
        {fairwayCards.length > 0 && (
          <IonRow>
            <IonCol className="header">{t('popup.area.fairways')}</IonCol>
          </IonRow>
        )}
        {fairwayCards?.map((card, index) => {
          return (
            <IonRow key={index}>
              <IonCol>
                <Link to={`/kortit/${card.id}`}>{card.name[lang]}</Link>
              </IonCol>
            </IonRow>
          );
        })}
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
