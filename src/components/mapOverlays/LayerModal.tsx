import React, { useEffect, useState } from 'react';
import { IonCheckbox, IonCol, IonRow, IonGrid, IonItem, IonList, IonModal, IonText } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { BackgroundMapType, getMap } from '../DvkMap';
import './LayerModal.css';
import { MAP } from '../../utils/constants';

interface ModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  bgMapType: BackgroundMapType;
  setBgMapType: (bgMapType: BackgroundMapType) => void;
}

interface CheckBoxProps {
  id: string;
  title: string;
}

const LayerModal: React.FC<ModalProps> = ({ isOpen, setIsOpen, bgMapType, setBgMapType }) => {
  const { t } = useTranslation();
  const [bgMap, setBgMap] = useState<BackgroundMapType>(bgMapType);
  const [layers, setLayers] = useState<string[]>(['pilot', 'line12', 'harbor']);
  const setBackgroundMap = (type: BackgroundMapType) => {
    setBgMapType(type);
    setBgMap(type);
  };
  const dvkMap = getMap();
  useEffect(() => {
    MAP.FEATURE_DATA_LAYERS.forEach((dataLayer) => {
      const layer = dvkMap.getFeatureLayer(dataLayer.id);
      layer.setVisible(layers.includes(dataLayer.id));
    });
  }, [layers, dvkMap]);
  const LayerItem: React.FC<CheckBoxProps> = ({ id, title }) => {
    return (
      <IonItem>
        <IonText>{title}</IonText>
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
        />
      </IonItem>
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
      <IonGrid>
        <IonRow>
          <IonCol>
            <IonText>
              <h6>{t('homePage.map.controls.layer.header')}</h6>
            </IonText>
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol className="borderBottom">
            <IonText>{t('homePage.map.controls.layer.class1')}</IonText>
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol>
            <IonList lines="none" className="ion-no-padding">
              <LayerItem id="area12" title={t('homePage.map.controls.layer.fairwayAreas')} />
              <LayerItem id="line12" title={t('homePage.map.controls.layer.lines')} />
              <LayerItem id="safetyequipment" title={t('homePage.map.controls.layer.safetyEquipments')} />
              <LayerItem id="restrictionarea" title={t('homePage.map.controls.layer.speedLimits')} />
              <LayerItem id="depth12" title={t('homePage.map.controls.layer.depths')} />
            </IonList>
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol className="borderBottom">
            <IonText>{t('homePage.map.controls.layer.class2')}</IonText>
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol>
            <IonList lines="none" className="ion-no-padding">
              <LayerItem id="area3456" title={t('homePage.map.controls.layer.fairwayAreas')} />
              <LayerItem id="line3456" title={t('homePage.map.controls.layer.lines')} />
              <LayerItem id="depth3456" title={t('homePage.map.controls.layer.depths')} />
            </IonList>
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol className="borderBottom" />
        </IonRow>
        <IonRow>
          <IonCol>
            <IonList lines="none" className="ion-no-padding">
              <LayerItem id="specialarea" title={t('homePage.map.controls.layer.specialAreas')} />
              <LayerItem id="pilot" title={t('homePage.map.controls.layer.pilotPlaces')} />
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
        <IonRow>
          <IonCol>
            <button
              color="none"
              className="ion-button ion-float-right bgMapButtonLand"
              disabled={bgMap === 'land'}
              onClick={() => setBackgroundMap('land')}
            >
              <div className="mapImage"></div>
              {t('homePage.map.controls.layer.mapStyle.landButtonLabel')}
            </button>
          </IonCol>
          <IonCol>
            <button
              color="none"
              className="ion-button ion-float-left bgMapButtonSea"
              disabled={bgMap === 'sea'}
              onClick={() => setBackgroundMap('sea')}
            >
              <div className="mapImage"></div>
              {t('homePage.map.controls.layer.mapStyle.seaButtonLabel')}
            </button>
          </IonCol>
        </IonRow>
      </IonGrid>
    </IonModal>
  );
};

export default LayerModal;
