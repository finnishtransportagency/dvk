import React, { useCallback, useEffect, useState } from 'react';
import { IonCheckbox, IonCol, IonRow, IonGrid, IonItem, IonText, IonButton, IonIcon } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { getMap } from '../DvkMap';
import './LayerModal.css';
import { getAlertProperties } from '../../utils/common';
import { useDvkContext } from '../../hooks/dvkContext';
import arrowDownIcon from '../../theme/img/arrow_down.svg';
import { ReactComponent as DepthMW } from '../../theme/img/syvyys_mw.svg';
import { ReactComponent as DepthN2000 } from '../../theme/img/syvyys_n2000.svg';
import { LayerAlert } from '../Alert';
import alertIcon from '../../theme/img/alert_icon.svg';
import { FeatureDataLayerId } from '../../utils/constants';

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
  noOfflineSupport?: boolean;
  layers: string[];
  setLayers: React.Dispatch<React.SetStateAction<string[]>>;
}

const LayerItem: React.FC<LayerItemProps> = ({ id, title, noOfflineSupport, layers, setLayers }) => {
  const { t } = useTranslation();
  const { state } = useDvkContext();
  const [legendOpen, setLegendOpen] = useState(false);
  const [legends, setLegends] = useState<string[]>([]);
  const dvkMap = getMap();

  useEffect(() => {
    if (noOfflineSupport && layers.includes(id) && state.isOffline) {
      setLayers((prev) => {
        return [...prev.filter((p) => p !== id)];
      });
    }
  }, [id, layers, noOfflineSupport, setLayers, state.isOffline]);

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
  if (id === 'mareograph' || id === 'buoy' || id === 'observation' || id === 'marinewarning') {
    alertProps = getAlertProperties(dataUpdatedAt, id);
  }
  const initialized = !!dataUpdatedAt || id === 'ice' || id === 'depthcontour' || id === 'deptharea' || id === 'soundingpoint';
  const disabled = !initialized || (noOfflineSupport && state.isOffline);

  const getLayerItemAlertText = useCallback(() => {
    if (!alertProps || !alertProps.duration) return t('warnings.lastUpdatedUnknown');
    return t('warnings.lastUpdatedAt2', { val: alertProps.duration });
  }, [alertProps, t]);

  return (
    <IonGrid className="ion-no-padding layerItem">
      <IonRow>
        <IonCol>
          <IonItem>
            <IonText id={`${title}-label`} className={disabled ? 'disabled' : ''}>
              {title}
            </IonText>
            <IonCheckbox
              aria-labelledby={`${title}-label`}
              value={id}
              checked={layers.includes(id)}
              slot="start"
              onClick={() =>
                setLayers((prev) => {
                  if (prev.includes(id)) {
                    return [...prev.filter((p) => p !== id)];
                  }
                  return [...prev, id];
                })
              }
              disabled={disabled}
            />
            <IonText slot="end" className={'layer ' + id}></IonText>
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
      {alertProps && <LayerAlert icon={alertIcon} className={'layerAlert'} title={getLayerItemAlertText()} color={alertProps.color} />}
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
