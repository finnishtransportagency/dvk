import React from 'react';
import { IonCol, IonGrid, IonRow } from '@ionic/react';
import './popup.css';
import { RestrictionPortFeatureProperties } from '../features';
import { PopupProperties } from '../mapOverlays/MapOverlays';
import { clearClickSelectionFeatures } from './selectInteraction';
import CloseButton from './CloseButton';
import { useTranslation } from 'react-i18next';

type RestrictionPortPopupContentProps = {
  restrictionPort: RestrictionPortProperties;
  setPopupProperties?: (properties: PopupProperties) => void;
};

export type RestrictionPortProperties = {
  properties: RestrictionPortFeatureProperties;
};

const RestrictionPortPopupContent: React.FC<RestrictionPortPopupContentProps> = ({ restrictionPort, setPopupProperties }) => {
  const { t } = useTranslation();
  console.log(restrictionPort);

  const currentRestrictions = restrictionPort.properties.restrictions
    .filter((r) => Date.parse(r.startTime) <= Date.now() && (!r.endTime || Date.parse(r.endTime) > Date.now()))
    .sort((a, b) => Date.parse(b.startTime) - Date.parse(a.startTime));
  const upcomingRestrictions = restrictionPort.properties.restrictions
    .filter((r) => Date.parse(r.startTime) > Date.now())
    .sort((a, b) => Date.parse(b.startTime) - Date.parse(a.startTime));

  const closePopup = () => {
    if (setPopupProperties) setPopupProperties({});
    clearClickSelectionFeatures();
  };

  return (
    <IonGrid className="ion-no-padding">
      <IonRow className="ion-justify-content-between">
        <IonCol size="auto" className="header">
          {restrictionPort.properties.name}
        </IonCol>
        <IonCol size="auto">
          <CloseButton close={closePopup} />
        </IonCol>
      </IonRow>
      <IonRow>
        <IonCol className="header">{t('popup.restriction.current')}</IonCol>
      </IonRow>
      {currentRestrictions.map((r) => (
        <IonRow key={r.id}>
          <IonCol>{r.description}</IonCol>
        </IonRow>
      ))}
      <IonRow>
        <IonCol className="header">{t('popup.restriction.upcoming')}</IonCol>
      </IonRow>
      {upcomingRestrictions.map((r) => (
        <IonRow key={r.id}>
          <IonCol>{r.description}</IonCol>
        </IonRow>
      ))}
    </IonGrid>
  );
};

export default RestrictionPortPopupContent;
