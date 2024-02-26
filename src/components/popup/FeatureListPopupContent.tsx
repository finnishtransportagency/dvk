import React from 'react';
import './popup.css';
import { PopupProperties } from '../mapOverlays/MapOverlays';
import Feature, { FeatureLike } from 'ol/Feature';
import { Coordinate } from 'ol/coordinate';
import { IonIcon, IonItem, IonLabel, IonList, IonText } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import closeIcon from '../../theme/img/close_black_24dp.svg';
import { setClickSelectionFeature } from './selectInteraction';
import { showFeaturePopup } from './popup';
import { Geometry } from 'ol/geom';

export type FeatureListProperties = {
  features: FeatureLike[];
  coordinate: Coordinate;
};

type FeatureListPopupContentProps = {
  featureList: FeatureListProperties;
  setPopupProperties: (properties: PopupProperties) => void;
};

const FeatureListPopupContent: React.FC<FeatureListPopupContentProps> = ({ featureList, setPopupProperties }) => {
  const { t } = useTranslation();
  const { features, coordinate } = featureList;

  const selectFeature = (feature: FeatureLike) => {
    highlightFeature(feature, false);
    setClickSelectionFeature(feature);
    showFeaturePopup(features, feature, coordinate, setPopupProperties);
  };

  const highlightFeature = (feature: FeatureLike, selected: boolean) => {
    const f = feature as Feature<Geometry>;
    f.set('hoverStyle', selected);
  };

  return (
    <div className="featureList">
      <div className="featureListHeader">
        <IonText className="header">{`${t('popup.featureList.multipleFeatures')}:`}</IonText>
      </div>
      <IonList>
        {features.map((feature) => {
          return (
            <IonItem
              key={`${feature.get('featureType')}-${feature.getId()}`}
              lines="none"
              button
              onClick={() => selectFeature(feature)}
              onFocus={() => highlightFeature(feature, true)}
              onMouseEnter={() => highlightFeature(feature, true)}
              onBlur={() => highlightFeature(feature, false)}
              onMouseLeave={() => highlightFeature(feature, false)}
            >
              <IonLabel>{feature.get('featureType')}</IonLabel>
              <IonIcon slot="end" icon={closeIcon}></IonIcon>
            </IonItem>
          );
        })}
      </IonList>
    </div>
  );
};

export default FeatureListPopupContent;
