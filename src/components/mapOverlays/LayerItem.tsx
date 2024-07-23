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
import { FeatureDataLayerId } from '../../utils/constants';
import type { CheckboxCustomEvent } from '@ionic/react';
import { LegendSpeedlimits, LegendIce, LegendDepth, LegendArea, LegendContour } from './LayerLegends';

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
  if (['mareograph', 'buoy', 'observation', 'coastalwarning', 'localwarning', 'boaterwarning', 'safetyequipmentfault', 'ice'].includes(id)) {
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
              <IonIcon icon={arrowDownIcon} />
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
