import React, { useEffect, useState } from 'react';
import { IonCol, IonRow, IonGrid, IonList, IonModal, IonText, IonButton, IonIcon, IonListHeader } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { BackgroundMapType, getMap } from '../DvkMap';
import './LayerModal.css';
import { MAP } from '../../utils/constants';
import { refreshPrintableMap } from '../../utils/common';
import LayerItem from './LayerItem';
import closeIcon from '../../theme/img/close_black_24dp.svg';

interface ModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  bgMapType: BackgroundMapType;
  setBgMapType: (bgMapType: BackgroundMapType) => void;
  setMarineWarningLayer: (marineWarningLayer: boolean) => void;
}

const LayerModal: React.FC<ModalProps> = ({ isOpen, setIsOpen, bgMapType, setBgMapType, setMarineWarningLayer }) => {
  const { t } = useTranslation();
  const [bgMap, setBgMap] = useState<BackgroundMapType>(bgMapType);
  const [layers, setLayers] = useState<string[]>(['pilot', 'line12', 'harbor', 'name']);
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
              <IonIcon className="otherIconLarge" src={closeIcon} />
            </IonButton>
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol>
            <IonGrid className="ion-no-padding">
              <IonRow>
                <IonCol>
                  <IonList lines="none" className="ion-no-padding" aria-labelledby="class1-label">
                    <IonListHeader lines="full">
                      <IonText id="class1-label">{t('homePage.map.controls.layer.class1')}</IonText>
                    </IonListHeader>
                    <LayerItem id="area12" title={t('homePage.map.controls.layer.fairwayAreas')} layers={layers} setLayers={setLayers} />
                    <LayerItem id="line12" title={t('homePage.map.controls.layer.lines')} layers={layers} setLayers={setLayers} />
                    <LayerItem id="vtsline" title={t('homePage.map.controls.layer.vtsline')} layers={layers} setLayers={setLayers} />
                    <LayerItem id="vtspoint" title={t('homePage.map.controls.layer.vtspoint')} layers={layers} setLayers={setLayers} />
                    <LayerItem id="boardline12" title={t('homePage.map.controls.layer.boardLines')} layers={layers} setLayers={setLayers} />
                    <LayerItem id="safetyequipment" title={t('homePage.map.controls.layer.safetyEquipments')} layers={layers} setLayers={setLayers} />
                    <LayerItem id="speedlimit" title={t('homePage.map.controls.layer.speedLimits')} layers={layers} setLayers={setLayers} />
                    <LayerItem id="depth12" title={t('homePage.map.controls.layer.depths')} layers={layers} setLayers={setLayers} />
                  </IonList>
                </IonCol>
              </IonRow>
              <IonRow>
                <IonCol>
                  <IonList lines="none" className="ion-no-padding" aria-labelledby="class2-label">
                    <IonListHeader lines="full">
                      <IonText id="class2-label">{t('homePage.map.controls.layer.class2')}</IonText>
                    </IonListHeader>
                    <LayerItem id="area3456" title={t('homePage.map.controls.layer.fairwayAreas')} layers={layers} setLayers={setLayers} />
                    <LayerItem id="line3456" title={t('homePage.map.controls.layer.lines')} layers={layers} setLayers={setLayers} />
                  </IonList>
                </IonCol>
              </IonRow>
              <IonRow>
                <IonCol>
                  <IonList lines="none" className="ion-no-padding" aria-labelledby="general-label">
                    <IonListHeader lines="full">
                      <IonText id="general-label">{t('homePage.map.controls.layer.general')}</IonText>
                    </IonListHeader>
                    <LayerItem id="specialarea" title={t('homePage.map.controls.layer.specialAreas')} layers={layers} setLayers={setLayers} />
                    <LayerItem id="pilot" title={t('homePage.map.controls.layer.pilotPlaces')} layers={layers} setLayers={setLayers} />
                    <LayerItem id="soundingpoint" title={t('homePage.map.controls.layer.soundingpoint')} layers={layers} setLayers={setLayers} />
                    <LayerItem
                      id="depthcontour"
                      noOfflineSupport
                      title={t('homePage.map.controls.layer.depthcontour')}
                      layers={layers}
                      setLayers={setLayers}
                    />
                    <LayerItem id="marinewarning" title={t('homePage.map.controls.layer.marineWarnings')} layers={layers} setLayers={setLayers} />
                    <LayerItem
                      id="mareograph"
                      noOfflineSupport
                      title={t('homePage.map.controls.layer.seaLevel')}
                      layers={layers}
                      setLayers={setLayers}
                    />
                    <LayerItem
                      id="observation"
                      noOfflineSupport
                      title={t('homePage.map.controls.layer.weatherStation')}
                      layers={layers}
                      setLayers={setLayers}
                    />
                    <LayerItem id="buoy" noOfflineSupport title={t('homePage.map.controls.layer.buoys')} layers={layers} setLayers={setLayers} />
                    <LayerItem id="ice" noOfflineSupport title={t('homePage.map.controls.layer.ice')} layers={layers} setLayers={setLayers} />
                    <LayerItem id="name" title={t('homePage.map.controls.layer.name')} layers={layers} setLayers={setLayers} />
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
