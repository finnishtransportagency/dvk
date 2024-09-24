import React, { useState } from 'react';
import { IonCheckbox, IonCol, IonRow, IonItem, IonText, IonButton, IonIcon, IonList } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import './LayerModal.css';
import { useDvkContext } from '../../hooks/dvkContext';
import arrowDownIcon from '../../theme/img/arrow_down.svg';
import { LayerType } from './LayerModal';
import LayerItem from './LayerItem';
import { FeatureDataLayerId } from '../../utils/constants';
import { hasOfflineSupport } from '../../utils/common';
import AisPredictorControl from './AisPredictorControl';

interface LayerMainItemProps {
  currentLayer: LayerType;
}

const LayerMainItem: React.FC<LayerMainItemProps> = ({ currentLayer }) => {
  const { t } = useTranslation();
  const { state, dispatch } = useDvkContext();
  const { isOffline, layers } = state;
  const [legendOpen, setLegendOpen] = useState(false);
  const toggleDetails = () => {
    setLegendOpen(!legendOpen);
  };

  const updateLayers = (updatedLayers: string[]) => dispatch({ type: 'setLayers', payload: { value: updatedLayers } });

  const isDisabled = () => {
    return isOffline && !!currentLayer.childLayers?.every((child) => !hasOfflineSupport(child.id as FeatureDataLayerId));
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
    // Check previous state
    if (isChecked() || isIndeterminate()) {
      updateLayers(layersWOCurrentChildLayers);
      if (currentLayer.id === 'ais') {
        dispatch({ type: 'setShowAisPredictor', payload: { value: false } });
      }
    } else {
      updateLayers(layersWOCurrentChildLayers.concat(currentLayer.childLayers?.flatMap((child) => child.id) ?? []));
      if (currentLayer.id === 'ais') {
        dispatch({ type: 'setShowAisPredictor', payload: { value: true } });
      }
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
              disabled={isDisabled()}
              indeterminate={isIndeterminate()}
              labelPlacement="end"
              justify="start"
            >
              <IonText id={`${currentLayer.title}-label`} className={isDisabled() ? 'labelText disabled' : 'labelText'}>
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
              aria-label={legendOpen ? t('common.close') : t('common.open')}
              onClick={() => toggleDetails()}
            >
              <IonIcon icon={arrowDownIcon} />
            </IonButton>
          )}
        </IonCol>
      </IonRow>
      {currentLayer.id === 'ais' && (
        <IonRow className={'toggle mainToggle ' + (legendOpen ? 'show' : 'hide')}>
          <IonCol>
            <AisPredictorControl />
          </IonCol>
        </IonRow>
      )}
      <IonRow className={'toggle mainToggle ' + (legendOpen ? 'show' : 'hide')}>
        <IonCol>
          <IonList lines="none" className="ion-no-padding" aria-label={currentLayer.title}>
            {currentLayer.childLayers
              ?.filter((l) => !l.hidden)
              ?.map((child) => (
                <LayerItem
                  key={child.id}
                  id={child.id as FeatureDataLayerId}
                  title={child.title}
                  mainLegendOpen={legendOpen}
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
