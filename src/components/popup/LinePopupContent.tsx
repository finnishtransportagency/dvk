import React from 'react';
import { IonButton, IonCol, IonGrid, IonIcon, IonRow } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import './popup.css';
import { Link } from 'react-router-dom';
import { Lang } from '../../utils/constants';
import { LineFeatureProperties } from '../features';
import { Text } from '../../graphql/generated';
import { isShowN2000HeightSystem } from '../layerStyles/depthStyles';
import { PopupProperties } from '../mapOverlays/MapOverlays';

type LinePopupContentProps = {
  line: LineProperties;
  setPopupProperties?: (properties: PopupProperties) => void;
};

export type LineProperties = {
  coordinates: number[];
  properties: LineFeatureProperties;
};

type FairwayCardIdName = {
  id: string;
  name: Text;
};

const LinePopupContent: React.FC<LinePopupContentProps> = ({ line, setPopupProperties }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage as Lang;

  const fairwayCards: FairwayCardIdName[] = [];
  line.properties?.fairways?.forEach((f) => {
    if (f.fairwayCards) {
      fairwayCards.push(...f.fairwayCards);
    }
  });
  const showN2000HeightSystem = isShowN2000HeightSystem(line.properties);

  const closePopup = () => {
    if (setPopupProperties) setPopupProperties({});
  };

  return (
    <IonGrid id="linePopupContent" class="ion-padding">
      <IonGrid class="ion-no-padding">
        {line.properties.fairways?.map((fairway, index) => {
          return (
            <IonRow key={fairway.fairwayId} className="ion-justify-content-between">
              <IonCol size="auto" className="header">
                {fairway.name[lang] || fairway.name.fi} {fairway.fairwayId}
              </IonCol>
              {index === 0 && (
                <IonCol size="auto">
                  <IonButton
                    fill="clear"
                    className="closeButton"
                    onClick={() => closePopup()}
                    title={t('common.close')}
                    aria-label={t('common.close')}
                  >
                    <IonIcon className="otherIconLarge" src="/assets/icon/close_black_24dp.svg" />
                  </IonButton>
                </IonCol>
              )}
            </IonRow>
          );
        })}
        {showN2000HeightSystem !== undefined && (
          <IonRow>
            <IonCol>{showN2000HeightSystem ? 'N2000 (BSCD2000)' : 'MW'}</IonCol>
          </IonRow>
        )}
        <IonRow>
          <IonCol className="header">{t('popup.line.info')}</IonCol>
        </IonRow>
        {(line.properties.n2000draft || line.properties.draft) && (
          <IonRow>
            <IonCol>
              {t('popup.line.draft', { val: showN2000HeightSystem ? line.properties.n2000draft : line.properties.draft })}{' '}
              <span
                aria-label={t('fairwayCards.unit.mDesc', { count: showN2000HeightSystem ? line.properties.n2000draft : line.properties.draft })}
                role="definition"
              >
                m
              </span>
            </IonCol>
          </IonRow>
        )}
        {(line.properties.n2000depth || line.properties.depth) && (
          <IonRow>
            <IonCol>
              {t('popup.line.depth', { val: showN2000HeightSystem ? line.properties.n2000depth : line.properties.depth })}{' '}
              <span
                aria-label={t('fairwayCards.unit.mDesc', { count: showN2000HeightSystem ? line.properties.n2000depth : line.properties.depth })}
                role="definition"
              >
                m
              </span>
            </IonCol>
          </IonRow>
        )}
        {line.properties.length && (
          <IonRow>
            <IonCol>
              {t('popup.line.length', { val: line.properties.length })}{' '}
              <span aria-label={t('fairwayCards.unit.mDesc', { count: line.properties.length })} role="definition">
                m
              </span>
            </IonCol>
          </IonRow>
        )}
        {line.properties.direction && (
          <IonRow>
            <IonCol>
              {t('popup.line.direction', { val: line.properties.direction })}{' '}
              <span aria-label={t('fairwayCards.unit.degDesc', { count: line.properties.direction })} role="definition">
                °
              </span>
            </IonCol>
          </IonRow>
        )}
        {fairwayCards.length > 0 && (
          <IonRow>
            <IonCol className="header">{t('popup.line.fairways')}</IonCol>
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
        {line.properties.extra && (
          <>
            <IonRow>
              <IonCol className="header">{t('popup.line.extra')}</IonCol>
            </IonRow>
            <IonRow>
              <IonCol>{line.properties.extra}</IonCol>
            </IonRow>
          </>
        )}
      </IonGrid>
    </IonGrid>
  );
};

export default LinePopupContent;
