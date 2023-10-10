import React from 'react';
import { IonButton, IonCol, IonGrid, IonIcon, IonRow } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import './popup.css';
import { Link } from 'react-router-dom';
import { Lang } from '../../utils/constants';
import { LineFeatureProperties } from '../features';
import { Text } from '../../graphql/generated';
import InfoIcon from '../../theme/img/info.svg?react';
import { isShowN2000HeightSystem } from '../layerStyles/depthStyles';
import { PopupProperties } from '../mapOverlays/MapOverlays';
import closeIcon from '../../theme/img/close_black_24dp.svg';
import dvkMap from '../DvkMap';
import { deselectClickSelection } from './popup';

type LinePopupContentProps = {
  line: LineProperties;
  setPopupProperties?: (properties: PopupProperties) => void;
};

export type LineProperties = {
  coordinates: number[];
  properties: LineFeatureProperties;
  width: number | undefined;
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
    /* Remove fairway width features */
    dvkMap.getVectorSource('fairwaywidth').clear();
    if (setPopupProperties) setPopupProperties({});
    deselectClickSelection();
  };

  function getValue(n2000Value: string | number | undefined, value: string | number | undefined) {
    if (!showN2000HeightSystem || n2000Value === null || n2000Value === undefined) {
      return value;
    }
    return n2000Value;
  }

  const lineDepth = getValue(line.properties.n2000depth, line.properties.depth) as number;
  const lineDraft = getValue(line.properties.n2000draft, line.properties.draft) as number;
  const lineReferenceLevel = getValue(line.properties.n2000ReferenceLevel, line.properties.referenceLevel) as string;

  return (
    <IonGrid id="linePopupContent" class="ion-padding">
      <IonGrid class="ion-no-padding">
        {line.properties.fairways?.map((fairway, index) => {
          return (
            <IonRow key={fairway.fairwayId} className="ion-justify-content-between">
              <IonCol size="auto" className="header">
                {fairway.name[lang] ?? fairway.name.fi} {fairway.fairwayId}
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
                    <IonIcon className="otherIconLarge" src={closeIcon} />
                  </IonButton>
                </IonCol>
              )}
            </IonRow>
          );
        })}
        {(line.properties.depth || line.properties.draft || line.properties.n2000depth || line.properties.n2000draft) && (
          <IonRow>
            <IonCol>
              <em>{lineReferenceLevel}</em>
            </IonCol>
          </IonRow>
        )}
        <IonRow>
          <IonCol className="header">{t('popup.line.info')}</IonCol>
        </IonRow>
        {(line.properties.n2000draft || line.properties.draft) && (
          <IonRow>
            <IonCol>
              {t('popup.line.draft', { val: lineDraft })}{' '}
              <span
                aria-label={t('fairwayCards.unit.mDesc', {
                  count: lineDraft,
                })}
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
              {t('popup.line.depth', { val: lineDepth })}{' '}
              <span
                aria-label={t('fairwayCards.unit.mDesc', {
                  count: lineDepth,
                })}
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
        <IonRow>
          <IonCol className="header">{t('popup.line.fairways')}</IonCol>
        </IonRow>
        {fairwayCards.length > 0 ? (
          fairwayCards?.map((card) => {
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

        {line.width && (
          <>
            <IonRow>
              <IonCol className="header">{t('popup.line.width')}</IonCol>
            </IonRow>
            <IonRow>
              <IonCol>
                {Math.floor(line.width)}
                <span aria-label={t('fairwayCards.unit.mDesc', { count: line.width })} role="definition">
                  m
                </span>
              </IonCol>
            </IonRow>
          </>
        )}

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
