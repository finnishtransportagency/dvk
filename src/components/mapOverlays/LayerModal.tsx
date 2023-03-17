import React, { useEffect, useState } from 'react';
import { IonCheckbox, IonCol, IonRow, IonGrid, IonItem, IonList, IonModal, IonText, IonButton, IonIcon } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { BackgroundMapType, getMap } from '../DvkMap';
import './LayerModal.css';
import { MAP } from '../../utils/constants';
import { refreshPrintableMap } from '../../utils/common';
import { useDvkContext } from '../../hooks/dvkContext';
import arrowDownIcon from '../../theme/img/arrow_down.svg';
import { ReactComponent as DepthMW } from '../../theme/img/syvyys_mw.svg';
import { ReactComponent as DepthN2000 } from '../../theme/img/syvyys_n2000.svg';

interface ModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  bgMapType: BackgroundMapType;
  setBgMapType: (bgMapType: BackgroundMapType) => void;
  setMarineWarningLayer: (marineWarningLayer: boolean) => void;
}

interface CheckBoxProps {
  id: string;
  title: string;
  noOfflineSupport?: boolean;
}

const LayerModal: React.FC<ModalProps> = ({ isOpen, setIsOpen, bgMapType, setBgMapType, setMarineWarningLayer }) => {
  const { t } = useTranslation();
  const [bgMap, setBgMap] = useState<BackgroundMapType>(bgMapType);
  const [layers, setLayers] = useState<string[]>(['pilot', 'line12', 'harbor']);
  const [legends, setLegends] = useState<string[]>([]);
  const setBackgroundMap = (type: BackgroundMapType) => {
    setBgMapType(type);
    setBgMap(type);
  };
  const dvkMap = getMap();

  useEffect(() => {
    MAP.FEATURE_DATA_LAYERS.forEach((dataLayer) => {
      const layer = dvkMap.getFeatureLayer(dataLayer.id);
      if (dataLayer.id === 'marinewarning' && layer.getVisible() !== layers.includes(dataLayer.id))
        setMarineWarningLayer(layers.includes(dataLayer.id));
      layer.setVisible(layers.includes(dataLayer.id));
    });
    setTimeout(refreshPrintableMap, 100);
  }, [layers, setMarineWarningLayer, dvkMap]);

  const LegendDepth = () => {
    return (
      <IonGrid className="legend speedlimit ion-no-padding">
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

  const LegendSpeedlimits = () => {
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

  const LayerItem: React.FC<CheckBoxProps> = ({ id, title, noOfflineSupport }) => {
    const { state } = useDvkContext();
    const [legendOpen, setLegendOpen] = useState(false);

    useEffect(() => {
      if (noOfflineSupport && layers.includes(id) && state.isOffline) {
        setLayers((prev) => {
          return [...prev.filter((p) => p !== id)];
        });
      }
    }, [id, noOfflineSupport, state.isOffline]);

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

    return (
      <IonGrid className="ion-no-padding layerItem">
        <IonRow>
          <IonCol>
            <IonItem>
              <IonText className={noOfflineSupport && state.isOffline ? 'disabled' : ''}>{title}</IonText>
              <IonCheckbox
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
                disabled={noOfflineSupport && state.isOffline}
              />
              <IonText slot="end" className={'layer ' + id}></IonText>
            </IonItem>
          </IonCol>
          <IonCol size="auto">
            {(id === 'speedlimit' || id === 'ice' || id === 'depth12') && (
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
        {(id === 'speedlimit' || id === 'ice' || id === 'depth12') && (
          <IonRow className={'toggle ' + (legendOpen || legends.includes(id) ? 'show' : 'hide')}>
            <IonCol>
              {id === 'speedlimit' && <LegendSpeedlimits />}
              {id === 'ice' && <LegendIce />}
              {id === 'depth12' && <LegendDepth />}
            </IonCol>
          </IonRow>
        )}
      </IonGrid>
    );
  };

  return (
    <IonModal
      id="layerModalContainer"
      isOpen={isOpen}
      onDidDismiss={() => {
        setIsOpen(false);
      }}
    >
      <IonGrid className="mainGrid">
        <IonRow className="section ion-align-items-center">
          <IonCol>
            <IonText>
              <h6>{t('homePage.map.controls.layer.header')}</h6>
            </IonText>
          </IonCol>
          <IonCol size="auto">
            <IonButton
              fill="clear"
              className="closeButton"
              onClick={() => setIsOpen(false)}
              data-testid="closeMenu"
              title={t('common.close')}
              aria-label={t('common.close')}
            >
              <IonIcon className="otherIconLarge" src="assets/icon/close_black_24dp.svg" />
            </IonButton>
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol>
            <IonGrid className="ion-no-padding">
              <IonRow>
                <IonCol className="divider">
                  <IonText>{t('homePage.map.controls.layer.class1')}</IonText>
                </IonCol>
              </IonRow>
              <IonRow>
                <IonCol>
                  <IonList lines="none" className="ion-no-padding">
                    <LayerItem id="area12" title={t('homePage.map.controls.layer.fairwayAreas')} />
                    <LayerItem id="line12" title={t('homePage.map.controls.layer.lines')} />
                    <LayerItem id="vts" title={t('homePage.map.controls.layer.vts')} />
                    <LayerItem id="boardline12" title={t('homePage.map.controls.layer.boardLines')} />
                    <LayerItem id="safetyequipment" title={t('homePage.map.controls.layer.safetyEquipments')} />
                    <LayerItem id="speedlimit" title={t('homePage.map.controls.layer.speedLimits')} />
                    <LayerItem id="depth12" title={t('homePage.map.controls.layer.depths')} />
                  </IonList>
                </IonCol>
              </IonRow>
              <IonRow>
                <IonCol className="divider">
                  <IonText>{t('homePage.map.controls.layer.class2')}</IonText>
                </IonCol>
              </IonRow>
              <IonRow>
                <IonCol>
                  <IonList lines="none" className="ion-no-padding">
                    <LayerItem id="area3456" title={t('homePage.map.controls.layer.fairwayAreas')} />
                    <LayerItem id="line3456" title={t('homePage.map.controls.layer.lines')} />
                  </IonList>
                </IonCol>
              </IonRow>
              <IonRow>
                <IonCol className="divider" />
              </IonRow>
              <IonRow>
                <IonCol>
                  <IonList lines="none" className="ion-no-padding">
                    <LayerItem id="specialarea" title={t('homePage.map.controls.layer.specialAreas')} />
                    <LayerItem id="pilot" title={t('homePage.map.controls.layer.pilotPlaces')} />
                    <LayerItem id="marinewarning" title={t('homePage.map.controls.layer.marineWarnings')} />
                    <LayerItem id="mareograph" noOfflineSupport title={t('homePage.map.controls.layer.seaLevel')} />
                    <LayerItem id="observation" noOfflineSupport title={t('homePage.map.controls.layer.weatherStation')} />
                    <LayerItem id="buoy" noOfflineSupport title={t('homePage.map.controls.layer.buoys')} />
                    <LayerItem id="ice" noOfflineSupport title={t('homePage.map.controls.layer.ice')} />
                  </IonList>
                </IonCol>
              </IonRow>
              <IonRow>
                <IonCol>
                  <IonText>
                    <h6>{t('homePage.map.controls.layer.mapStyle.header')}</h6>
                  </IonText>
                </IonCol>
              </IonRow>
              <IonRow className="ion-justify-content-evenly">
                <IonCol size="auto">
                  <button color="none" className="ion-button bgMapButtonLand" disabled={bgMap === 'land'} onClick={() => setBackgroundMap('land')}>
                    <div className="mapImage"></div>
                    {t('homePage.map.controls.layer.mapStyle.landButtonLabel')}
                  </button>
                </IonCol>
                <IonCol size="auto">
                  <button color="none" className="ion-button bgMapButtonSea" disabled={bgMap === 'sea'} onClick={() => setBackgroundMap('sea')}>
                    <div className="mapImage"></div>
                    {t('homePage.map.controls.layer.mapStyle.seaButtonLabel')}
                  </button>
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonCol>
        </IonRow>
      </IonGrid>
    </IonModal>
  );
};

export default LayerModal;
