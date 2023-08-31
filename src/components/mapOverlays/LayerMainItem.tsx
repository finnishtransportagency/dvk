import React, { useState } from 'react';
import { IonCheckbox, IonCol, IonRow, IonGrid, IonItem, IonText, IonButton, IonIcon, IonList } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import './LayerModal.css';
import { useDvkContext } from '../../hooks/dvkContext';
import arrowDownIcon from '../../theme/img/arrow_down.svg';
import { LayerType } from './LayerModal';
import LayerItem from './LayerItem';
import { FeatureDataLayerId } from '../../utils/constants';
import { getAssetUrl, hasOfflineSupport } from '../../utils/common';

interface LayerMainItemProps {
  currentLayer: LayerType;
  layers: string[];
  setLayers: React.Dispatch<React.SetStateAction<string[]>>;
}

const LayerMainItem: React.FC<LayerMainItemProps> = ({ currentLayer, layers, setLayers }) => {
  const { t } = useTranslation();
  const { state } = useDvkContext();
  const [legendOpen, setLegendOpen] = useState(false);

  const toggleDetails = () => {
    setLegendOpen(!legendOpen);
  };

  const isDisabled = () => {
    return state.isOffline && !!currentLayer.childLayers?.every((child) => !hasOfflineSupport(child.id as FeatureDataLayerId));
  };
  const selectedChildLayers =
    currentLayer.childLayers?.flatMap((child) => (layers.includes(child.id) ? child.id : null)).filter((layerId) => layerId) || [];
  const isChecked = () => {
    return selectedChildLayers?.length === (currentLayer.childLayers || []).length;
  };
  const isIndeterminate = () => {
    return selectedChildLayers?.length > 0 && selectedChildLayers?.length < (currentLayer.childLayers || []).length;
  };
  const layersWOCurrentChildLayers = layers?.filter((layer) => !(currentLayer.childLayers?.filter((child) => child.id === layer) || []).length);
  const handleChange = () => {
    if (isChecked() || isIndeterminate()) {
      if (currentLayer.id === 'marinewarning') {
        // Remove also parent layer from selection
        setLayers(layersWOCurrentChildLayers.filter((layer) => layer !== currentLayer.id));
      } else {
        setLayers(layersWOCurrentChildLayers);
      }
    } else {
      const updatedLayers = layersWOCurrentChildLayers.concat(currentLayer.childLayers?.flatMap((child) => child.id) || []);
      if (currentLayer.id === 'marinewarning') {
        // Add also parent layer, if not already included in layer selection
        setLayers(updatedLayers.includes(currentLayer.id) ? updatedLayers : updatedLayers.concat(currentLayer.id));
      } else {
        setLayers(updatedLayers);
      }
      setLegendOpen(true);
    }
  };

  return (
    <IonGrid className="ion-no-padding layerItem layerMainItem">
      <IonRow>
        <IonCol>
          <IonItem lines="none">
            <IonCheckbox
              aria-labelledby={`${currentLayer.title}-label`}
              value={currentLayer.id}
              checked={isChecked()}
              slot="start"
              onIonChange={handleChange}
              disabled={isDisabled()}
              indeterminate={isIndeterminate()}
              labelPlacement="end"
            >
              <IonText id={`${currentLayer.title}-label`} className={isDisabled() ? 'labelText disabled' : 'labelText'}>
                {currentLayer.title}
              </IonText>
              <IonText className={'layerLegend layer ' + currentLayer.id}></IonText>
            </IonCheckbox>
          </IonItem>
        </IonCol>
        <IonCol size="auto">
          {currentLayer.childLayers && currentLayer.childLayers?.length > 0 && (
            <IonButton
              fill="clear"
              className={'toggleButton' + (legendOpen ? ' close' : ' open')}
              aria-label={legendOpen ? t('common.close') : t('common.open')}
              onClick={() => toggleDetails()}
            >
              <IonIcon icon={getAssetUrl(arrowDownIcon)} />
            </IonButton>
          )}
        </IonCol>
      </IonRow>
      <IonRow className={'toggle mainToggle ' + (legendOpen ? 'show' : 'hide')}>
        <IonCol>
          <IonList lines="none" className="ion-no-padding" aria-label={currentLayer.title}>
            {currentLayer.childLayers?.map((child) => (
              <LayerItem
                key={child.id}
                id={child.id as FeatureDataLayerId}
                title={child.title}
                layers={layers}
                setLayers={setLayers}
                parentLayer={currentLayer}
                aria-hidden={!legendOpen}
              />
            ))}
          </IonList>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};

export default LayerMainItem;
