import React, { useCallback, useState } from 'react';
import { IonCheckbox, IonCol, IonRow, IonItem, IonText, IonButton, IonIcon } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { getMap } from '../DvkMap';
import './LayerModal.css';
import { getAlertProperties, hasOfflineSupport, updateIceLayerOpacity } from '../../utils/common';
import { useDvkContext } from '../../hooks/dvkContext';
import arrowDownIcon from '../../theme/img/arrow_down.svg';
import { LayerAlert } from '../Alert';
import alertIcon from '../../theme/img/alert_icon.svg';
import { FeatureDataLayerId, LAYER_IDB_KEY } from '../../utils/constants';
import type { CheckboxCustomEvent } from '@ionic/react';
import { LegendSpeedlimits, LegendIce, LegendDepth, LegendArea, LegendContour } from './LayerLegends';
import { set as setIdbVal } from 'idb-keyval';

interface LayerItemProps {
  id: FeatureDataLayerId;
  title: string;
  mainLegendOpen?: boolean;
}

const LayerItem: React.FC<LayerItemProps> = ({ id, title, mainLegendOpen }) => {
  const { t } = useTranslation();
  const { state, dispatch } = useDvkContext();
  const { isOffline, layers } = state;
  const [legendOpen, setLegendOpen] = useState(false);
  const [legends, setLegends] = useState<string[]>([]);
  const dvkMap = getMap();

  const toggleDetails = () => {
    setLegendOpen(!legendOpen);
    setTimeout(() => {
      setLegends((prev) => {
        if (prev.includes(id)) {
          return [...prev.filter((l) => l !== id)];
        }
        return [...prev, id];
      });
    }, 250);
  };

  let alertProps:
    | {
        duration: number;
        color: string;
      }
    | undefined = undefined;
  const layer = dvkMap.getFeatureLayer(id);
  const dataUpdatedAt = layer.get('dataUpdatedAt');
  const fetchedDate = layer.get('fetchedDate');
  // isError and isFeatures is for checking if modal for (503) unavailable resources is needed
  // if layer is in error state and there's not features on layer, we can determine if we can get any data
  const isError = layer.get('isError');
  let isFeatures = false;
  if (['mareograph', 'buoy', 'observation', 'coastalwarning', 'localwarning', 'boaterwarning', 'safetyequipmentfault', 'ice'].includes(id)) {
    if (id !== 'ice') {
      isFeatures = dvkMap.getVectorSource(id).getFeatures().length > 0;
    }
    // the second conditional here is for buoys since they are loaded when layer is selected
    if (fetchedDate || (!fetchedDate && layer.get('errorUpdatedAt'))) {
      alertProps = getAlertProperties(fetchedDate, id);
    }
  }

  const isDisabled = (): boolean => {
    const initialized =
      !!dataUpdatedAt ||
      [
        'depthcontour',
        'deptharea',
        'buoy',
        'ice',
        'soundingpoint',
        'aisvesselcargo',
        'aisvesseltanker',
        'aisvesselpassenger',
        'aisvesselhighspeed',
        'aisvesseltugandspecialcraft',
        'aisvesselpleasurecraft',
        'aisunspecified',
        'pilotroute',
        'pilotageareaborder',
      ].includes(id) ||
      (!!fetchedDate && ['ice', 'mareograph', 'observation', 'safetyequipmentfault'].includes(id));

    return !initialized || (!hasOfflineSupport(id) && isOffline);
  };

  const disabled = isDisabled();

  const getLayerItemAlertText = useCallback(() => {
    if (!alertProps?.duration) return t('warnings.layerLoadError');
    return t('warnings.lastUpdatedAt2', { val: alertProps.duration });
  }, [alertProps, t]);

  const handleChange = (event: CheckboxCustomEvent) => {
    const { checked } = event.detail;
    const updatedLayers = checked ? [...layers, id] : layers.filter((l) => l !== id);
    if (state.saveLayerSelection) {
      setIdbVal(LAYER_IDB_KEY, updatedLayers);
    }
    dispatch({ type: 'setLayers', payload: { value: updatedLayers } });
    // Set ice layer opacity depending on current view resolution
    if (checked && id === 'ice') {
      updateIceLayerOpacity();
    }
  };

  return (
    <>
      <IonRow>
        <IonCol>
          <IonItem>
            <IonCheckbox
              aria-labelledby={`${title}-label`}
              value={id}
              checked={layers.includes(id)}
              onIonChange={handleChange}
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
          {(id === 'speedlimit' || id === 'ice' || id === 'depth12' || id === 'deptharea' || id === 'depthcontour') && (
            <IonButton
              fill="clear"
              className={'toggleButton' + (legendOpen || legends.includes(id) ? ' close' : ' open')}
              aria-label={legendOpen || legends.includes(id) ? t('common.close') : t('common.open')}
              onClick={() => toggleDetails()}
            >
              <IonIcon icon={arrowDownIcon} aria-hidden="true" />
            </IonButton>
          )}
        </IonCol>
      </IonRow>
      {alertProps && (
        <LayerAlert
          icon={alertIcon}
          className={'layerAlert'}
          title={getLayerItemAlertText()}
          color={alertProps.color}
          mainLegendOpen={mainLegendOpen}
          isError={isError}
          isFeatures={isFeatures}
        />
      )}
      {(id === 'speedlimit' || id === 'ice' || id === 'depth12' || id === 'deptharea' || id === 'depthcontour') && (
        <IonRow className={'toggle ' + (legendOpen || legends.includes(id) ? 'show' : 'hide')}>
          <IonCol>
            {id === 'speedlimit' && <LegendSpeedlimits />}
            {id === 'ice' && <LegendIce />}
            {id === 'depth12' && <LegendDepth />}
            {id === 'deptharea' && <LegendArea />}
            {id === 'depthcontour' && <LegendContour />}
          </IonCol>
        </IonRow>
      )}
    </>
  );
};

export default LayerItem;
