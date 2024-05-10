import React from 'react';
import { IonCol, IonGrid, IonRow } from '@ionic/react';
import './popup.css';
import { PilotageLimitFeatureProperties } from '../features';
import { PopupProperties } from '../mapOverlays/MapOverlays';
import { clearClickSelectionFeatures } from './selectInteraction';
import CloseButton from './CloseButton';
import { useTranslation } from 'react-i18next';
import { Geometry, LineString } from 'ol/geom';
import { coordinatesToStringHDM } from '../../utils/coordinateUtils';
import { Lang } from '../../utils/constants';
import { useFairwayCardListData } from '../../utils/dataLoader';
import { Link } from 'react-router-dom';
import InfoIcon from '../../theme/img/info.svg?react';
import { useDvkContext } from '../../hooks/dvkContext';
import { getPilotageLimitFairwayCards } from '../../utils/fairwayCardUtils';

type PilotageLimitPopupContentProps = {
  pilotagelimit: PilotageLimitProperties;
  setPopupProperties?: (properties: PopupProperties) => void;
};

export type PilotageLimitProperties = {
  geometry: Geometry;
  properties: PilotageLimitFeatureProperties;
};

const PilotageLimitPopupContent: React.FC<PilotageLimitPopupContentProps> = ({ pilotagelimit, setPopupProperties }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage as Lang;
  const { state } = useDvkContext();

  const closePopup = () => {
    if (setPopupProperties) setPopupProperties({});
    clearClickSelectionFeatures();
  };

  const line = pilotagelimit.geometry as LineString;
  const firstCoord = line.getFirstCoordinate();
  const lastCoord = line.getLastCoordinate();
  const westCoord = firstCoord[0] <= lastCoord[0] ? firstCoord : lastCoord;
  const eastCoord = firstCoord[0] > lastCoord[0] ? firstCoord : lastCoord;

  let limit = pilotagelimit.properties.raja_fi;
  if (lang === 'sv') {
    limit = pilotagelimit.properties.raja_sv;
  } else if (lang === 'en') {
    limit = pilotagelimit.properties.raja_en;
  }

  const { data } = useFairwayCardListData();
  const fairwayCards = data ? getPilotageLimitFairwayCards(pilotagelimit.properties, data.fairwayCards) : [];

  return (
    <IonGrid className="ion-no-padding">
      <IonRow className="ion-justify-content-between">
        <IonCol size="auto" className="header">
          {t('popup.pilotageLimit.header', { val: pilotagelimit?.properties.numero })}
        </IonCol>
        <IonCol size="auto">
          <CloseButton close={closePopup} />
        </IonCol>
      </IonRow>
      <IonRow>
        <IonCol className="header">{t('popup.pilotageLimit.location')}</IonCol>
      </IonRow>
      <IonRow>
        <IonCol>{coordinatesToStringHDM(westCoord)}</IonCol>
      </IonRow>
      <IonRow>
        <IonCol>{coordinatesToStringHDM(eastCoord)}</IonCol>
      </IonRow>
      <IonRow>
        <IonCol className="header">{t('popup.pilotageLimit.limit')}</IonCol>
      </IonRow>
      <IonRow>
        <IonCol>
          {t('popup.pilotageLimit.dimensions')}
          <br />
          {limit.replaceAll('/', ' / ')}
        </IonCol>
      </IonRow>
      <IonRow>
        <IonCol className="header">{t('popup.pilotageLimit.fairways')}</IonCol>
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
    </IonGrid>
  );
};

export default PilotageLimitPopupContent;
