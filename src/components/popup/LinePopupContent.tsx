import React from 'react';
import { IonCol, IonGrid, IonRow } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import './popup.css';
import { Link } from 'react-router-dom';
import { Lang } from '../../utils/constants';
import { LineFeatureProperties, isShowN2000HeightSystem } from '../features';
import InfoIcon from '../../theme/img/info.svg?react';
import { PopupProperties } from '../mapOverlays/MapOverlays';
import dvkMap from '../DvkMap';
import { clearClickSelectionFeatures } from './selectInteraction';
import CloseButton from './CloseButton';
import { useDvkContext } from '../../hooks/dvkContext';
import { padNumber } from 'ol/string';
import { useFairwayCardListData } from '../../utils/dataLoader';
import { getFairwayListFairwayCards } from '../../utils/fairwayCardUtils';

type LinePopupContentProps = {
  line: LineProperties;
  setPopupProperties?: (properties: PopupProperties) => void;
};

export type LineProperties = {
  coordinates: number[];
  properties: LineFeatureProperties;
  width: number | undefined;
};

const LinePopupContent: React.FC<LinePopupContentProps> = ({ line, setPopupProperties }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage as Lang;
  const { state } = useDvkContext();
  const { data } = useFairwayCardListData();

  const showN2000HeightSystem = isShowN2000HeightSystem(line.properties);

  const closePopup = () => {
    /* Remove fairway width features */
    dvkMap.getVectorSource('fairwaywidth').clear();
    if (setPopupProperties) setPopupProperties({});
    clearClickSelectionFeatures();
  };

  const getValue = (n2000Value: string | number | undefined, value: string | number | undefined) => {
    if (!showN2000HeightSystem || n2000Value === null || n2000Value === undefined) {
      return value;
    }
    return n2000Value;
  };

  const degreesToString = (degrees: number) => padNumber(degrees, 3, 1).replace('.', ',');
  const direction1 = Math.min(line.properties.direction ?? -1, line.properties.oppositeDirection ?? -1);
  const direction2 = Math.max(line.properties.direction ?? -1, line.properties.oppositeDirection ?? -1);

  const lineDepth = getValue(line.properties.n2000depth, line.properties.depth) as number;
  const lineDraft = getValue(line.properties.n2000draft, line.properties.draft) as number;
  const lineReferenceLevel = getValue(line.properties.n2000ReferenceLevel, line.properties.referenceLevel) as string;

  const fairwayCards = data ? getFairwayListFairwayCards(line.properties.fairways ?? [], data.fairwayCards) : [];

  return (
    <IonGrid className="ion-no-padding">
      {line.properties.fairways?.map((fairway, index) => {
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
            <dd
              aria-label={t('fairwayCards.unit.mDesc', {
                count: lineDraft,
              })}
            >
              m
            </dd>
          </IonCol>
        </IonRow>
      )}
      {(line.properties.n2000depth || line.properties.depth) && (
        <IonRow>
          <IonCol>
            {t('popup.line.depth', { val: lineDepth })}{' '}
            <dd
              aria-label={t('fairwayCards.unit.mDesc', {
                count: lineDepth,
              })}
            >
              m
            </dd>
          </IonCol>
        </IonRow>
      )}
      {line.properties.length && (
        <IonRow>
          <IonCol>
            {t('popup.line.length', { val: line.properties.length })}{' '}
            <dd aria-label={t('fairwayCards.unit.mDesc', { count: line.properties.length })}>m</dd>
          </IonCol>
        </IonRow>
      )}
      {direction1 > 0 && direction2 > 0 && (
        <IonRow>
          <IonCol>
            {t('popup.line.direction')} {degreesToString(direction1)}
            <dd aria-label={t('fairwayCards.unit.degDesc_other')}>°</dd>
            {' - '}
            {degreesToString(direction2)}
            <dd aria-label={t('fairwayCards.unit.degDesc_other')}>°</dd>
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

      {line.width && (
        <>
          <IonRow>
            <IonCol className="header">{t('popup.line.width')}</IonCol>
          </IonRow>
          <IonRow>
            <IonCol>
              {Math.floor(line.width)}
              <dd aria-label={t('fairwayCards.unit.mDesc', { count: line.width })}>m</dd>
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
  );
};

export default LinePopupContent;
