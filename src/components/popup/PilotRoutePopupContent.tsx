import React from 'react';
import { IonCol, IonGrid, IonRow } from '@ionic/react';
import './popup.css';
import { PilotRouteFeatureProperties } from '../features';
import { PopupProperties } from '../mapOverlays/MapOverlays';
import { clearClickSelectionFeatures } from './selectInteraction';
import CloseButton from './CloseButton';
import { useTranslation } from 'react-i18next';
import { RtzFileDownload } from '../RtzFileDownload';
import { useDvkContext } from '../../hooks/dvkContext';
import { Link } from 'react-router-dom';
import { Lang } from '../../utils/constants';
import InfoIcon from '../../theme/img/info.svg?react';

type PilotRoutePopupContentProps = {
  pilotroute: PilotRouteProperties;
  setPopupProperties?: (properties: PopupProperties) => void;
};

export type PilotRouteProperties = {
  properties: PilotRouteFeatureProperties;
};

const PilotRoutePopupContent: React.FC<PilotRoutePopupContentProps> = ({ pilotroute, setPopupProperties }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage as Lang;
  const { state } = useDvkContext();

  const closePopup = () => {
    if (setPopupProperties) setPopupProperties({});
    clearClickSelectionFeatures();
  };

  return (
    <IonGrid className="ion-no-padding">
      <IonRow className="ion-justify-content-between">
        <IonCol size="auto" className="header">
          {t('popup.pilotRoute.header', { val: pilotroute.properties.name })}
        </IonCol>
        <IonCol size="auto">
          <CloseButton close={closePopup} />
        </IonCol>
      </IonRow>
      {pilotroute.properties.rtz && (
        <>
          <IonRow>
            <IonCol className="header">{t('routes.rtz')}</IonCol>
          </IonRow>
          <IonRow>
            <IonCol>
              <RtzFileDownload name={pilotroute.properties.name} rtz={pilotroute.properties.rtz} />
            </IonCol>
          </IonRow>
        </>
      )}
      <IonRow>
        <IonCol className="header">{t('popup.pilotRoute.fairwayCards')}</IonCol>
      </IonRow>
      {pilotroute.properties.fairwayCards.length > 0 ? (
        pilotroute.properties.fairwayCards.map((card) => {
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

export default PilotRoutePopupContent;
