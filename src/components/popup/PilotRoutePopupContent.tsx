import React from 'react';
import { IonCol, IonGrid, IonRow } from '@ionic/react';
import './popup.css';
import { PilotRouteFeatureProperties } from '../features';
import { PopupProperties } from '../mapOverlays/MapOverlays';
import { clearClickSelectionFeatures } from './selectInteraction';
import CloseButton from './CloseButton';
import { useTranslation } from 'react-i18next';

type PilotRoutePopupContentProps = {
  pilotroute: PilotRouteProperties;
  setPopupProperties?: (properties: PopupProperties) => void;
};

export type PilotRouteProperties = {
  properties: PilotRouteFeatureProperties;
};

const PilotRoutePopupContent: React.FC<PilotRoutePopupContentProps> = ({ pilotroute, setPopupProperties }) => {
  const { t } = useTranslation();

  const closePopup = () => {
    if (setPopupProperties) setPopupProperties({});
    clearClickSelectionFeatures();
  };

  return (
    <IonGrid className="ion-no-padding">
      <IonRow className="ion-justify-content-between">
        <IonCol size="auto" className="header">
          {t('popup.pilotRoute.header', { val: pilotroute?.properties.name })}
        </IonCol>
        <IonCol size="auto">
          <CloseButton close={closePopup} />
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};

export default PilotRoutePopupContent;
