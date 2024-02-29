import React from 'react';
import './popup.css';
import './FeatureListPopupContent.css';
import { PopupProperties } from '../mapOverlays/MapOverlays';
import Feature, { FeatureLike } from 'ol/Feature';
import { Coordinate } from 'ol/coordinate';
import { IonCol, IonGrid, IonItem, IonLabel, IonList, IonRow, IonText } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { clearClickSelectionFeatures, setClickSelectionFeature } from './selectInteraction';
import { getFeatureDetails, showFeaturePopup } from './popup';
import { Geometry } from 'ol/geom';
import { Lang } from '../../utils/constants';
import CloseButton from './CloseButton';

export type FeatureListProperties = {
  features: FeatureLike[];
  coordinate: Coordinate;
};

type FeatureListPopupContentProps = {
  featureList: FeatureListProperties;
  setPopupProperties: (properties: PopupProperties) => void;
};

const FeatureListPopupContent: React.FC<FeatureListPopupContentProps> = ({ featureList, setPopupProperties }) => {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'popup' });
  const lang = i18n.resolvedLanguage as Lang;
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

  const closePopup = () => {
    if (setPopupProperties) setPopupProperties({});
    clearClickSelectionFeatures();
  };

  return (
    <div className="featureList">
      <IonGrid className="featureListHeader ion-no-padding">
        <IonRow>
          <IonCol>
            <IonText className="header">{`${t('featureList.multipleFeatures')}:`}</IonText>
          </IonCol>
          <IonCol size="auto">
            <CloseButton close={closePopup} />
          </IonCol>
        </IonRow>
      </IonGrid>
      <IonList>
        {features.map((feature) => {
          const details = getFeatureDetails(t, lang, feature);
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
              <IonLabel>
                {details?.header?.map((text, index) => {
                  return (
                    /* S6479 false positive fixed in SonarJs release 10.12.0  */
                    <p key={`${feature.getId}-header-${index}-${text}`} className="headerText">
                      {text}
                    </p>
                  );
                })}
                <p>{details?.featureType ?? ''}</p>
              </IonLabel>
              <IonText slot="end" className={'layer ' + (details?.className ?? '')} />
            </IonItem>
          );
        })}
      </IonList>
    </div>
  );
};

export default FeatureListPopupContent;
