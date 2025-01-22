import React, { useEffect, useState } from 'react';
import { IonCheckbox, IonCol, IonRow, IonItem, IonText, IonButton, IonIcon, IonList } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import './LayerModal.css';
import arrowDownIcon from '../../../theme/img/arrow_down.svg';
import { LayerType } from './LayerModal';
import LayerItem from './LayerItem';
import { FeatureDataLayerId } from '../../../utils/constants';

interface LayerMainItemProps {
  currentLayer: LayerType;
  layers: string[];
  setLayers: React.Dispatch<React.SetStateAction<string[]>>;
}

const LayerMainItem: React.FC<LayerMainItemProps> = ({ currentLayer, layers, setLayers }) => {
  const { t } = useTranslation();
  const [legendOpen, setLegendOpen] = useState(false);

  useEffect(() => {
    if (layers.includes(currentLayer.id)) {
      setLayers((prev) => {
        return [...prev.filter((p) => p !== currentLayer.id)];
      });
    }
  }, [currentLayer.id, layers, setLayers]);

  const toggleDetails = () => {
    setLegendOpen(!legendOpen);
  };

  const selectedChildLayers =
    currentLayer.childLayers?.flatMap((child) => (layers.includes(child.id) ? child.id : null)).filter((layerId) => layerId) ?? [];
  const isChecked = () => {
    return selectedChildLayers?.length === (currentLayer.childLayers ?? []).length;
  };
  const isIndeterminate = () => {
    return selectedChildLayers?.length > 0 && selectedChildLayers?.length < (currentLayer.childLayers ?? []).length;
  };
  const layersWOCurrentChildLayers = layers?.filter((layer) => !(currentLayer.childLayers?.filter((child) => child.id === layer) ?? []).length);
  const handleChange = () => {
    if (isChecked() || isIndeterminate()) {
      setLayers(layersWOCurrentChildLayers);
    } else {
      setLayers(layersWOCurrentChildLayers.concat(currentLayer.childLayers?.flatMap((child) => child.id) ?? []));
      setLegendOpen(true);
    }
  };

  return (
    <>
      <IonRow>
        <IonCol>
          <IonItem lines="none">
            <IonCheckbox
              aria-labelledby={`${currentLayer.title}-label`}
              value={currentLayer.id}
              checked={isChecked()}
              onIonChange={handleChange}
              indeterminate={isIndeterminate()}
              labelPlacement="end"
              justify="start"
            >
              <IonText id={`${currentLayer.title}-label`} className="labelText">
                {currentLayer.title}
              </IonText>
            </IonCheckbox>
          </IonItem>
        </IonCol>
        <IonCol size="auto">
          {currentLayer.childLayers && currentLayer.childLayers?.length > 0 && (
            <IonButton
              fill="clear"
              className={'toggleButton' + (legendOpen ? ' close' : ' open')}
              aria-label={(legendOpen ? t('common.close') : t('common.open')) || ''}
              onClick={() => toggleDetails()}
            >
              <IonIcon icon={arrowDownIcon} aria-hidden="true" />
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
                aria-hidden={!legendOpen}
              />
            ))}
          </IonList>
        </IonCol>
      </IonRow>
    </>
  );
};

export default LayerMainItem;
