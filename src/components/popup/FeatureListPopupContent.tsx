import React from 'react';
import './popup.css';
import { PopupProperties } from '../mapOverlays/MapOverlays';
import { FeatureLike } from 'ol/Feature';
import { Coordinate } from 'ol/coordinate';
import { IonCol, IonGrid, IonList, IonRow } from '@ionic/react';
import { useTranslation } from 'react-i18next';

export type FeatureListProperties = {
  features: FeatureLike[];
  coordinate: Coordinate;
};

type FeatureListPopupContentProps = {
  featureList: FeatureListProperties;
  setPopupProperties?: (properties: PopupProperties) => void;
};

const FeatureListPopupContent: React.FC<FeatureListPopupContentProps> = ({ featureList, setPopupProperties }) => {
  const { t } = useTranslation();
  console.log(featureList, setPopupProperties);

  return (
    <IonGrid>
      <IonRow>
        <IonCol className="header">{`${t('popup.common.multipleFeatures')}:`}</IonCol>
      </IonRow>
      <IonRow>
        <IonCol>
          <IonList></IonList>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};

export default FeatureListPopupContent;
