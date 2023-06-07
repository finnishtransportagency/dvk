import React, { useEffect, useState } from 'react';
import { IonCol, IonRow, IonGrid, IonList, IonModal, IonText, IonButton, IonIcon } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { BackgroundMapType, getMap } from '../DvkMap';
import './LayerModal.css';
import { FeatureDataLayerId, FeatureDataMainLayerId, MAP } from '../../utils/constants';
import { refreshPrintableMap } from '../../utils/common';
import LayerItem from './LayerItem';
import closeIcon from '../../theme/img/close_black_24dp.svg';
import { Maybe } from '../../graphql/generated';
import LayerMainItem from './LayerMainItem';

interface ModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  bgMapType: BackgroundMapType;
  setBgMapType: (bgMapType: BackgroundMapType) => void;
  setMarineWarningLayer: (marineWarningLayer: boolean) => void;
}

export type LayerType = {
  id: FeatureDataLayerId | FeatureDataMainLayerId;
  title: string;
  childLayers?: Maybe<Array<LayerType>>;
  noOfflineSupport?: Maybe<boolean>;
};

const LayerModal: React.FC<ModalProps> = ({ isOpen, setIsOpen, bgMapType, setBgMapType, setMarineWarningLayer }) => {
  const { t } = useTranslation();
  const [bgMap, setBgMap] = useState<BackgroundMapType>(bgMapType);
  const [layers, setLayers] = useState<string[]>(['pilot', 'line12', 'harbor', 'name']);
  const setBackgroundMap = (type: BackgroundMapType) => {
    setBgMapType(type);
    setBgMap(type);
  };
  const dvkMap = getMap();

  const layerStructure: LayerType[] = [
    {
      id: 'merchant',
      title: t('homePage.map.controls.layer.class1'),
      childLayers: [
        { id: 'line12', title: t('homePage.map.controls.layer.lines') },
        { id: 'boardline12', title: t('homePage.map.controls.layer.boardLines') },
        { id: 'area12', title: t('homePage.map.controls.layer.fairwayAreas') },
        { id: 'circle', title: t('homePage.map.controls.layer.circles') },
      ],
    },
    {
      id: 'othertraffic',
      title: t('homePage.map.controls.layer.class2'),
      childLayers: [
        { id: 'line3456', title: t('homePage.map.controls.layer.lines') },
        { id: 'area3456', title: t('homePage.map.controls.layer.fairwayAreas') },
      ],
    },
    {
      id: 'depths',
      title: t('homePage.map.controls.layer.depthinfo'),
      childLayers: [
        { id: 'soundingpoint', title: t('homePage.map.controls.layer.soundingpoint'), noOfflineSupport: true },
        { id: 'depthcontour', title: t('homePage.map.controls.layer.depthcontour'), noOfflineSupport: true },
        { id: 'deptharea', title: t('homePage.map.controls.layer.deptharea'), noOfflineSupport: true },
      ],
    },
    { id: 'speedlimit', title: t('homePage.map.controls.layer.speedLimits') },
    { id: 'specialarea', title: t('homePage.map.controls.layer.specialAreas') },
    { id: 'depth12', title: t('homePage.map.controls.layer.depths') },
    { id: 'safetyequipment', title: t('homePage.map.controls.layer.safetyEquipments') },
    {
      id: 'conditions',
      title: t('homePage.map.controls.layer.conditions'),
      childLayers: [
        { id: 'mareograph', title: t('homePage.map.controls.layer.seaLevel'), noOfflineSupport: true },
        { id: 'observation', title: t('homePage.map.controls.layer.weatherStation'), noOfflineSupport: true },
        { id: 'buoy', title: t('homePage.map.controls.layer.buoys'), noOfflineSupport: true },
        { id: 'ice', title: t('homePage.map.controls.layer.ice'), noOfflineSupport: true },
      ],
    },
    { id: 'marinewarning', title: t('homePage.map.controls.layer.marineWarnings') },
    {
      id: 'vts',
      title: t('homePage.map.controls.layer.vts'),
      childLayers: [
        { id: 'vtspoint', title: t('homePage.map.controls.layer.vtspoint') },
        { id: 'vtsline', title: t('homePage.map.controls.layer.vtsline') },
      ],
    },
    { id: 'pilot', title: t('homePage.map.controls.layer.pilotPlaces') },
    { id: 'name', title: t('homePage.map.controls.layer.name') },
  ];

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
      <IonList id="layerModalContent" lines="none" className="ion-no-padding" aria-labelledby="layerlist-label">
        <IonGrid className="mainGrid">
          <IonRow className="section ion-align-items-center">
            <IonCol>
              <IonText id="layerlist-label">
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
          {layerStructure.map((layer) => (
            <IonRow key={layer.id}>
              <IonCol>
                {layer.childLayers && layer.childLayers.length > 0 && <LayerMainItem currentLayer={layer} layers={layers} setLayers={setLayers} />}
                {!layer.childLayers && (
                  <LayerItem
                    id={layer.id as FeatureDataLayerId}
                    title={layer.title}
                    noOfflineSupport={layer.noOfflineSupport || false}
                    layers={layers}
                    setLayers={setLayers}
                  />
                )}
              </IonCol>
            </IonRow>
          ))}

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
      </IonList>
    </IonModal>
  );
};

export default LayerModal;
