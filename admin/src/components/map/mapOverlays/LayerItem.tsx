import React, { useState } from 'react';
import { IonCheckbox, IonCol, IonRow, IonItem, IonText, IonButton, IonIcon } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { getMap } from '../DvkMap';
import './LayerModal.css';
import arrowDownIcon from '../../../theme/img/arrow_down.svg';
import { FeatureDataLayerId } from '../../../utils/constants';
import { LegendDepth, LegendSpeedlimits } from './LayerLegends';

interface LayerItemProps {
  id: FeatureDataLayerId;
  title: string;
  layers: string[];
  setLayers: React.Dispatch<React.SetStateAction<string[]>>;
}

const LayerItem: React.FC<LayerItemProps> = ({ id, title, layers, setLayers }) => {
  const { t } = useTranslation();
  const [legendOpen, setLegendOpen] = useState(false);
  const dvkMap = getMap();

  const toggleDetails = () => {
    setLegendOpen(!legendOpen);
  };
  const dataUpdatedAt = dvkMap.getFeatureLayer(id).get('dataUpdatedAt');
  const initialized = !!dataUpdatedAt;
  const disabled = !initialized;

  return (
    <>
      <IonRow>
        <IonCol>
          <IonItem>
            <IonCheckbox
              aria-labelledby={`${title}-label`}
              value={id}
              checked={layers.includes(id)}
              onIonChange={() =>
                setLayers((prev) => {
                  if (prev.includes(id)) {
                    return [...prev.filter((p) => p !== id)];
                  }
                  return [...prev, id];
                })
              }
              disabled={disabled}
              labelPlacement="end"
              justify="start"
            >
              <IonRow className="ion-align-items-center ion-justify-content-between">
                <IonCol>
                  <IonText id={`${title}-label`} className={disabled ? 'labelText disabled' : 'labelText'}>
                    {title}
                  </IonText>
                </IonCol>
                <IonCol size="auto">
                  <IonText className={'layerLegend layer ' + id}></IonText>
                </IonCol>
              </IonRow>
            </IonCheckbox>
          </IonItem>
        </IonCol>
        <IonCol size="auto">
          {(id === 'speedlimit' || id === 'depth12') && (
            <IonButton
              fill="clear"
              className={'toggleButton' + (legendOpen ? ' close' : ' open')}
              aria-label={(legendOpen ? t('common.close') : t('common.open')) || ''}
              onClick={() => toggleDetails()}
            >
              <IonIcon icon={arrowDownIcon} />
            </IonButton>
          )}
        </IonCol>
      </IonRow>
      {(id === 'speedlimit' || id === 'depth12') && (
        <IonRow className={'toggle ' + (legendOpen ? 'show' : 'hide')}>
          <IonCol>
            {id === 'speedlimit' && <LegendSpeedlimits />}
            {id === 'depth12' && <LegendDepth />}
          </IonCol>
        </IonRow>
      )}
    </>
  );
};

export default LayerItem;
