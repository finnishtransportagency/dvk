import React from 'react';
import { IonCol, IonGrid, IonRow } from '@ionic/react';
import './popup.css';
import { DirwayFeatureProperties } from '../features';
import { PopupProperties } from '../mapOverlays/MapOverlays';
import { clearClickSelectionFeatures } from './selectInteraction';
import CloseButton from './CloseButton';
import { useTranslation } from 'react-i18next';
import { coordinatesToStringHDM } from '../../utils/coordinateUtils';

type DirwayPopupContentProps = {
  dirway: DirwayProperties;
  setPopupProperties?: (properties: PopupProperties) => void;
};

export type DirwayProperties = {
  properties: DirwayFeatureProperties;
};

const DirwayPopupContent: React.FC<DirwayPopupContentProps> = ({ dirway, setPopupProperties }) => {
  const { t } = useTranslation();
  const points = dirway.properties.points.toSorted((a, b) => a.orderNumber - b.orderNumber);

  const closePopup = () => {
    if (setPopupProperties) setPopupProperties({});
    clearClickSelectionFeatures();
  };

  return (
    <IonGrid className="ion-no-padding">
      <IonRow className="ion-justify-content-between">
        <IonCol size="auto" className="header">
          {dirway.properties.name}
        </IonCol>
        <IonCol size="auto">
          <CloseButton close={closePopup} />
        </IonCol>
      </IonRow>
      <IonRow>
        <IonCol className="header">{t('popup.dirway.points')}</IonCol>
      </IonRow>
      {points.map((p, index) => (
        <IonRow key={p.orderNumber}>
          <IonCol>{`#${index + 1} - ${coordinatesToStringHDM(p.coordinates)}`}</IonCol>
        </IonRow>
      ))}
    </IonGrid>
  );
};

export default DirwayPopupContent;
