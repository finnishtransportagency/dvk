import React, { useCallback, useState } from 'react';
import { IonCheckbox, IonCol, IonRow, IonGrid, IonItem, IonText, IonButton, IonIcon } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { getMap } from '../DvkMap';
import './LayerModal.css';
import { getAlertProperties, hasOfflineSupport, updateIceLayerOpacity } from '../../utils/common';
import { useDvkContext } from '../../hooks/dvkContext';
import arrowDownIcon from '../../theme/img/arrow_down.svg';
import DepthMW from '../../theme/img/syvyys_mw.svg?react';
import DepthN2000 from '../../theme/img/syvyys_n2000.svg?react';
import { LayerAlert } from '../Alert';
import alertIcon from '../../theme/img/alert_icon.svg';
import { FeatureDataLayerId } from '../../utils/constants';
import type { CheckboxCustomEvent } from '@ionic/react';

const LegendDepth = () => {
  return (
    <IonGrid className="legend ion-no-padding">
      <IonRow>
        <IonCol size="2">
          <IonItem>
            <DepthN2000 />
          </IonItem>
        </IonCol>
        <IonCol size="3">
          <IonItem>
            <IonText>N2000</IonText>
          </IonItem>
        </IonCol>
        <IonCol size="2">
          <IonItem>
            <DepthMW />
          </IonItem>
        </IonCol>
        <IonCol>
          <IonItem>
            <IonText>MW</IonText>
          </IonItem>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};

const LegendArea = () => {
  const { t } = useTranslation();
  return (
    <IonGrid className="legend deptharea ion-no-padding">
      <IonRow>
        <IonCol>
          <IonItem>
            <IonText>{t('homePage.map.controls.layer.legend.depth1')}</IonText>
            <IonText slot="start" className="def area1"></IonText>
          </IonItem>
        </IonCol>
        <IonCol>
          <IonItem>
            <IonText>{t('homePage.map.controls.layer.legend.depth2')}</IonText>
            <IonText slot="start" className="def area2"></IonText>
          </IonItem>
        </IonCol>
      </IonRow>
      <IonRow>
        <IonCol>
          <IonItem>
            <IonText>{t('homePage.map.controls.layer.legend.depth3')}</IonText>
            <IonText slot="start" className="def area3"></IonText>
          </IonItem>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};

const LegendContour = () => {
  const { t } = useTranslation();
  return (
    <IonGrid className="legend depthcontour ion-no-padding">
      <IonRow>
        <IonCol>
          <IonItem>
            <IonText>{t('homePage.map.controls.layer.legend.depth4')}</IonText>
            <IonText slot="start" className="def line1"></IonText>
          </IonItem>
        </IonCol>
        <IonCol>
          <IonItem>
            <IonText>{t('homePage.map.controls.layer.legend.depth5')}</IonText>
            <IonText slot="start" className="def line2"></IonText>
          </IonItem>
        </IonCol>
      </IonRow>
      <IonRow>
        <IonCol>
          <IonItem>
            <IonText>{t('homePage.map.controls.layer.legend.depth6')}</IonText>
            <IonText slot="start" className="def line3"></IonText>
          </IonItem>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};

const LegendSpeedlimits = () => {
  const { t } = useTranslation();
  return (
    <IonGrid className="legend speedlimit ion-no-padding">
      <IonRow>
        <IonCol>
          <IonItem>
            <IonText>
              30-26{' '}
              <span aria-label={t('fairwayCards.unit.kmhDesc', { count: 0 })} role="definition">
                km/h
              </span>
            </IonText>
            <IonText slot="start" className="def limit30"></IonText>
          </IonItem>
        </IonCol>
        <IonCol>
          <IonItem>
            <IonText>
              25-21{' '}
              <span aria-label={t('fairwayCards.unit.kmhDesc', { count: 0 })} role="definition">
                km/h
              </span>
            </IonText>
            <IonText slot="start" className="def limit25"></IonText>
          </IonItem>
        </IonCol>
      </IonRow>
      <IonRow>
        <IonCol>
          <IonItem>
            <IonText>
              20-16{' '}
              <span aria-label={t('fairwayCards.unit.kmhDesc', { count: 0 })} role="definition">
                km/h
              </span>
            </IonText>
            <IonText slot="start" className="def limit20"></IonText>
          </IonItem>
        </IonCol>
        <IonCol>
          <IonItem>
            <IonText>
              15-11{' '}
              <span aria-label={t('fairwayCards.unit.kmhDesc', { count: 0 })} role="definition">
                km/h
              </span>
            </IonText>
            <IonText slot="start" className="def limit15"></IonText>
          </IonItem>
        </IonCol>
      </IonRow>
      <IonRow>
        <IonCol>
          <IonItem>
            <IonText>
              10-6{' '}
              <span aria-label={t('fairwayCards.unit.kmhDesc', { count: 0 })} role="definition">
                km/h
              </span>
            </IonText>
            <IonText slot="start" className="def limit10"></IonText>
          </IonItem>
        </IonCol>
        <IonCol>
          <IonItem>
            <IonText>
              5-1{' '}
              <span aria-label={t('fairwayCards.unit.kmhDesc', { count: 0 })} role="definition">
                km/h
              </span>
            </IonText>
            <IonText slot="start" className="def limit5"></IonText>
          </IonItem>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};

const LegendIce = () => {
  const { t } = useTranslation();
  return (
    <IonGrid className="legend ice ion-no-padding">
      <IonRow>
        <IonCol>
          <IonItem>
            <IonText>{t('homePage.map.controls.layer.legend.icefree')}</IonText>
            <IonText slot="start" className="def icefree"></IonText>
          </IonItem>
        </IonCol>
        <IonCol>
          <IonItem>
            <IonText>
              {t('homePage.map.controls.layer.legend.newice')} (&lt; 5{' '}
              <span aria-label={t('fairwayCards.unit.cmDesc', { count: 5 })} role="definition">
                cm
              </span>
              )
            </IonText>
            <IonText slot="start" className="def newice"></IonText>
          </IonItem>
        </IonCol>
      </IonRow>
      <IonRow>
        <IonCol>
          <IonItem>
            <IonText>
              {t('homePage.map.controls.layer.legend.thinice')} (5-15{' '}
              <span aria-label={t('fairwayCards.unit.cmDesc', { count: 5 })} role="definition">
                cm
              </span>
              )
            </IonText>
            <IonText slot="start" className="def thinice"></IonText>
          </IonItem>
        </IonCol>
        <IonCol>
          <IonItem>
            <IonText>{t('homePage.map.controls.layer.legend.fastice')}</IonText>
            <IonText slot="start" className="def fastice"></IonText>
          </IonItem>
        </IonCol>
      </IonRow>
      <IonRow>
        <IonCol>
          <IonItem>
            <IonText>{t('homePage.map.controls.layer.legend.rottenice')}</IonText>
            <IonText slot="start" className="def rottenice"></IonText>
          </IonItem>
        </IonCol>
        <IonCol>
          <IonItem>
            <IonText>{t('homePage.map.controls.layer.legend.openwater')}</IonText>
            <IonText slot="start" className="def openwater"></IonText>
          </IonItem>
        </IonCol>
      </IonRow>
      <IonRow>
        <IonCol>
          <IonItem>
            <IonText>{t('homePage.map.controls.layer.legend.veryopenice')}</IonText>
            <IonText slot="start" className="def veryopenice"></IonText>
          </IonItem>
        </IonCol>
        <IonCol>
          <IonItem>
            <IonText>{t('homePage.map.controls.layer.legend.openice')}</IonText>
            <IonText slot="start" className="def openice"></IonText>
          </IonItem>
        </IonCol>
      </IonRow>
      <IonRow>
        <IonCol>
          <IonItem>
            <IonText>{t('homePage.map.controls.layer.legend.closeice')}</IonText>
            <IonText slot="start" className="def closeice"></IonText>
          </IonItem>
        </IonCol>
        <IonCol>
          <IonItem>
            <IonText>{t('homePage.map.controls.layer.legend.verycloseice')}</IonText>
            <IonText slot="start" className="def verycloseice"></IonText>
          </IonItem>
        </IonCol>
      </IonRow>
      <IonRow>
        <IonCol>
          <IonItem>
            <IonText>{t('homePage.map.controls.layer.legend.consolidatedice')}</IonText>
            <IonText slot="start" className="def consolidatedice"></IonText>
          </IonItem>
        </IonCol>
        <IonCol></IonCol>
      </IonRow>
    </IonGrid>
  );
};

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
  const dataUpdatedAt = dvkMap.getFeatureLayer(id).get('dataUpdatedAt');
  if (['mareograph', 'buoy', 'observation', 'coastalwarning', 'localwarning', 'boaterwarning', 'ice'].includes(id)) {
    if (dvkMap.getFeatureLayer(id).get('errorUpdatedAt')) {
      alertProps = getAlertProperties(dataUpdatedAt, id);
    }
  }

  const isDisabled = (): boolean => {
    const initialized =
      !!dataUpdatedAt ||
      [
        'ice',
        'depthcontour',
        'deptharea',
        'soundingpoint',
        'mareograph',
        'observation',
        'buoy',
        'safetyequipmentfault',
        'aisvesselcargo',
        'aisvesseltanker',
        'aisvesselpassenger',
        'aisvesselhighspeed',
        'aisvesseltugandspecialcraft',
        'aisvesselpleasurecraft',
        'aisunspecified',
      ].includes(id);
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
    <IonGrid className="ion-no-padding layerItem">
      <IonRow>
        <IonCol>
          <IonItem>
            <IonCheckbox
              aria-labelledby={`${title}-label`}
              value={id}
              checked={layers.includes(id)}
              slot="start"
              onIonChange={handleChange}
              disabled={disabled}
              labelPlacement="end"
            >
              <IonText id={`${title}-label`} className={disabled ? 'labelText disabled' : 'labelText'}>
                {title}
              </IonText>
              <IonText className={'layerLegend layer ' + id}></IonText>
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
    </IonGrid>
  );
};

export default LayerItem;
