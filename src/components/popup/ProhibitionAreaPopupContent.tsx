import React from 'react';
import { IonCol, IonGrid, IonRow } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import './popup.css';
import { Link } from 'react-router-dom';
import { Lang } from '../../utils/constants';
import { ProhibitionAreaFeatureProperties } from '../features';
import InfoIcon from '../../theme/img/info.svg?react';
import { PopupProperties } from '../mapOverlays/MapOverlays';
import { clearClickSelectionFeatures } from './selectInteraction';
import CloseButton from './CloseButton';
import { useDvkContext } from '../../hooks/dvkContext';
import { getFairwayListFairwayCards } from '../../utils/fairwayCardUtils';
import { useFairwayCardListData } from '../../utils/dataLoader';

type ProhibitionAreaPopupContentProps = {
  area: ProhibitionAreaProperties;
  setPopupProperties?: (properties: PopupProperties) => void;
};

export type ProhibitionAreaProperties = {
  coordinates: number[];
  properties: ProhibitionAreaFeatureProperties;
};

const ProhibitionAreaPopupContent: React.FC<ProhibitionAreaPopupContentProps> = ({ area, setPopupProperties }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage as Lang;
  const { state } = useDvkContext();
  const { data } = useFairwayCardListData();

  const fairway = area.properties.fairway;
  const fairwayCards = data ? getFairwayListFairwayCards([fairway], data.fairwayCards) : [];

  const closePopup = () => {
    if (setPopupProperties) setPopupProperties({});
    clearClickSelectionFeatures();
  };

  return (
    <IonGrid className="ion-no-padding">
      <IonRow key={fairway.fairwayId} className="ion-justify-content-between">
        <IonCol size="auto" className="header">
          {fairway.name[lang] ?? fairway.name.fi} {fairway.fairwayId}
        </IonCol>
        <IonCol size="auto">
          <CloseButton close={closePopup} />
        </IonCol>
      </IonRow>
      <IonRow>
        <IonCol size="auto">{t('fairwayCards.areaType' + area.properties.typeCode)}</IonCol>
      </IonRow>
      <IonRow>
        <IonCol>
          <p className="info use-flex ion-align-items-center">
            <InfoIcon />
            {t('popup.area.overtake')}
          </p>
        </IonCol>
      </IonRow>
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
      <>
        <IonRow>
          <IonCol className="header">{t('popup.area.extra')}</IonCol>
        </IonRow>
        <IonRow>
          <IonCol>
            {area.properties.extraInfo?.[lang] || area.properties.extraInfo?.fi ? (
              <p>{area.properties.extraInfo[lang] ?? area.properties.extraInfo.fi}</p>
            ) : (
              <p className="info use-flex ion-align-items-center">
                <InfoIcon />
                {t('common.noDataSet')}
              </p>
            )}
          </IonCol>
        </IonRow>
      </>
    </IonGrid>
  );
};

export default ProhibitionAreaPopupContent;
