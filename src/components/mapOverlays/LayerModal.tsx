import React, { Fragment, useEffect, useState } from 'react';
import { IonCol, IonRow, IonGrid, IonList, IonModal, IonText, IonButton, IonIcon } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import dvkMap, { BackgroundMapType } from '../DvkMap';
import './LayerModal.css';
import { FeatureDataLayerId, FeatureDataMainLayerId, MAP } from '../../utils/constants';
import { hasOfflineSupport } from '../../utils/common';
import LayerItem from './LayerItem';
import closeIcon from '../../theme/img/close_black_24dp.svg';
import { Maybe } from '../../graphql/generated';
import LayerMainItem from './LayerMainItem';
import { useDvkContext } from '../../hooks/dvkContext';

interface ModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  bgMapType: BackgroundMapType;
  setBgMapType: (bgMapType: BackgroundMapType) => void;
  setMarineWarningNotificationLayer: (marineWarningLayer: boolean) => void;
}

export type LayerType = {
  id: FeatureDataLayerId | FeatureDataMainLayerId;
  title: string;
  childLayers?: Maybe<Array<LayerType>>;
};

const LayerModal: React.FC<ModalProps> = ({ isOpen, setIsOpen, bgMapType, setBgMapType, setMarineWarningNotificationLayer }) => {
  const { t } = useTranslation();
  const { state } = useDvkContext();
  const { isOffline, layers } = state;
  const [bgMap, setBgMap] = useState<BackgroundMapType>(bgMapType);
  const setBackgroundMap = (type: BackgroundMapType) => {
    setBgMapType(type);
    setBgMap(type);
  };

  const layerStructure: LayerType[] = [
    {
      id: 'merchant',
      title: t('homePage.map.controls.layer.class1'),
      childLayers: [
        { id: 'area12', title: t('homePage.map.controls.layer.fairwayAreas') },
        { id: 'line12', title: t('homePage.map.controls.layer.lines') },
        { id: 'boardline12', title: t('homePage.map.controls.layer.boardLines') },
        { id: 'circle', title: t('homePage.map.controls.layer.circles') },
      ],
    },
    {
      id: 'othertraffic',
      title: t('homePage.map.controls.layer.class2'),
      childLayers: [
        { id: 'area3456', title: t('homePage.map.controls.layer.fairwayAreas') },
        { id: 'line3456', title: t('homePage.map.controls.layer.lines') },
      ],
    },
    {
      id: 'depths',
      title: t('homePage.map.controls.layer.depthinfo'),
      childLayers: [
        { id: 'soundingpoint', title: t('homePage.map.controls.layer.soundingpoint') },
        { id: 'depthcontour', title: t('homePage.map.controls.layer.depthcontour') },
        { id: 'deptharea', title: t('homePage.map.controls.layer.deptharea') },
      ],
    },
    { id: 'speedlimit', title: t('homePage.map.controls.layer.speedLimits') },
    {
      id: 'specialarea',
      title: t('homePage.map.controls.layer.specialAreas'),
      childLayers: [
        { id: 'specialarea2', title: t('homePage.map.controls.layer.specialarea2') },
        { id: 'specialarea15', title: t('homePage.map.controls.layer.specialarea15') },
      ],
    },
    { id: 'depth12', title: t('homePage.map.controls.layer.depths') },
    {
      id: 'safetyequipment',
      title: t('homePage.map.controls.layer.safetyEquipmentsTitle'),
      childLayers: [
        { id: 'safetyequipment', title: t('homePage.map.controls.layer.safetyEquipments') },
        { id: 'safetyequipmentfault', title: t('homePage.map.controls.layer.safetyEquipmentFaults') },
      ],
    },
    {
      id: 'conditions',
      title: t('homePage.map.controls.layer.conditions'),
      childLayers: [
        { id: 'mareograph', title: t('homePage.map.controls.layer.seaLevel') },
        { id: 'observation', title: t('homePage.map.controls.layer.weatherStation') },
        { id: 'buoy', title: t('homePage.map.controls.layer.buoys') },
      ],
    },
    {
      id: 'marinewarning',
      title: t('homePage.map.controls.layer.marineWarnings'),
      childLayers: [
        { id: 'coastalwarning', title: t('homePage.map.controls.layer.coastalWarning') },
        { id: 'localwarning', title: t('homePage.map.controls.layer.localWarning') },
        { id: 'boaterwarning', title: t('homePage.map.controls.layer.boaterWarning') },
      ],
    },
    {
      id: 'vts',
      title: t('homePage.map.controls.layer.vts'),
      childLayers: [
        { id: 'vtsline', title: t('homePage.map.controls.layer.vtsline') },
        { id: 'vtspoint', title: t('homePage.map.controls.layer.vtspoint') },
      ],
    },
    {
      id: 'piloting',
      title: t('homePage.map.controls.layer.piloting'),
      childLayers: [
        { id: 'pilot', title: t('homePage.map.controls.layer.pilot') },
        { id: 'pilotagelimit', title: t('homePage.map.controls.layer.pilotageLimits') },
        { id: 'pilotageareaborder', title: t('homePage.map.controls.layer.pilotageAreaBorders') },
      ],
    },
    {
      id: 'ais',
      title: t('homePage.map.controls.layer.ais'),
      childLayers: [
        { id: 'aisvesselcargo', title: t('homePage.map.controls.layer.aisVesselCargo') },
        { id: 'aisvesseltanker', title: t('homePage.map.controls.layer.aisVesselTanker') },
        { id: 'aisvesselpassenger', title: t('homePage.map.controls.layer.aisVesselPassenger') },
        { id: 'aisvesselhighspeed', title: t('homePage.map.controls.layer.aisVesselHighSpeed') },
        { id: 'aisvesseltugandspecialcraft', title: t('homePage.map.controls.layer.aisVesselTugAndSpecialCraft') },
        { id: 'aisvesselpleasurecraft', title: t('homePage.map.controls.layer.aisVesselPleasureCraft') },
        { id: 'aisunspecified', title: t('homePage.map.controls.layer.aisUnspecified') },
      ],
    },
    {
      id: 'wintertraffic',
      title: t('homePage.map.controls.layer.winterTraffic'),
      childLayers: [
        { id: 'dirway', title: t('homePage.map.controls.layer.dirway') },
        { id: 'ice', title: t('homePage.map.controls.layer.ice') },
      ],
    },
    { id: 'name', title: t('homePage.map.controls.layer.name') },
  ];

  /* Add pilot route layer for testing purposes, if not production environment */
  if (import.meta.env.VITE_APP_ENV !== 'prod') {
    layerStructure[10].childLayers?.push({ id: 'pilotroute', title: t('homePage.map.controls.layer.pilotroutes') });
  }

  useEffect(() => {
    setMarineWarningNotificationLayer(layers.includes('coastalwarning') || layers.includes('localwarning') || layers.includes('boaterwarning'));

    MAP.FEATURE_DATA_LAYERS.forEach((dataLayer) => {
      const featureLayers = dvkMap.getFeatureLayers(dataLayer.id);
      featureLayers.forEach((featureLayer) => {
        featureLayer.setVisible(layers.includes(dataLayer.id) && (hasOfflineSupport(dataLayer.id) || !isOffline));
      });
    });
  }, [layers, setMarineWarningNotificationLayer, isOffline]);

  return (
    <IonModal
      id="layerModalContainer"
      isOpen={isOpen}
      onDidDismiss={() => {
        setIsOpen(false);
      }}
    >
      <div id="layerModalContent">
        <IonGrid className="mainGrid ion-no-padding">
          <IonRow className="ion-align-items-center">
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
          <IonList lines="none" className="ion-no-padding" aria-labelledby="layerlist-label">
            {layerStructure.map((layer) => {
              return (
                <Fragment key={layer.id}>
                  {layer.childLayers && layer.childLayers.length > 0 && <LayerMainItem currentLayer={layer} />}
                  {!layer.childLayers && <LayerItem id={layer.id as FeatureDataLayerId} title={layer.title} />}
                </Fragment>
              );
            })}
          </IonList>
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
      </div>
    </IonModal>
  );
};

export default LayerModal;
