import React, { useEffect, useState } from 'react';
import { IonCheckbox, IonCol, IonRow, IonGrid, IonItem, IonLabel, IonList, IonModal, IonText } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { BackgroundMapType, useMap } from '../DvkMap';
import './LayerModal.css';

interface ModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  bgMapType: BackgroundMapType;
  setBgMapType: (bgMapType: BackgroundMapType) => void;
}

interface CheckBoxProps {
  id: string;
}

const LayerModal: React.FC<ModalProps> = ({ isOpen, setIsOpen, bgMapType, setBgMapType }) => {
  const { t } = useTranslation();
  const [bgMap, setBgMap] = useState<BackgroundMapType>(bgMapType);
  const [layers, setLayers] = useState<string[]>([]);
  const setBackgroundMap = (type: BackgroundMapType) => {
    setBgMapType(type);
    setBgMap(type);
  };
  const dvkMap = useMap();
  useEffect(() => {
    dvkMap.olMap?.getAllLayers().forEach((layer) => {
      const layerId = layer.getProperties().id;
      if (layerId) {
        layer.setVisible(layers.includes(layerId));
      }
    });
  }, [layers, dvkMap]);
  const CheckBox: React.FC<CheckBoxProps> = ({ id }) => {
    return (
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
      <>
        <IonGrid>
          <IonRow>
            <IonCol>
              <IonText>
                <h6>{t('homePage.map.controls.layer.header')}</h6>
              </IonText>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol className="header">
              <IonText>{t('homePage.map.controls.layer.class1')}</IonText>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol>
              <IonList lines="none" className="ion-no-padding">
                <IonItem>
                  <IonText>{t('homePage.map.controls.layer.fairwayAreas')}</IonText>
                  <CheckBox id="area12" />
                </IonItem>
                <IonItem>
                  <IonText>{t('homePage.map.controls.layer.lines')}</IonText>
                  <CheckBox id="line12" />
                </IonItem>
              </IonList>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol className="header">
              <IonLabel>{t('homePage.map.controls.layer.class2')}</IonLabel>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol>
              <IonList lines="none" className="ion-no-padding">
                <IonItem>
                  <IonText>{t('homePage.map.controls.layer.fairwayAreas')}</IonText>
                  <CheckBox id="area3456" />
                </IonItem>
                <IonItem>
                  <IonText>{t('homePage.map.controls.layer.lines')}</IonText>
                  <CheckBox id="line3456" />
                </IonItem>
              </IonList>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol className="header" />
          </IonRow>
          <IonRow>
            <IonCol>
              <IonList lines="none" className="ion-no-padding">
                <IonItem>
                  <IonLabel>{t('homePage.map.controls.layer.depths')}</IonLabel>
                  <CheckBox id="depth" />
                </IonItem>
                <IonItem>
                  <IonLabel>{t('homePage.map.controls.layer.safetyEquipments')}</IonLabel>
                  <CheckBox id="safety" />
                </IonItem>
                <IonItem>
                  <IonLabel>{t('homePage.map.controls.layer.speedLimits')}</IonLabel>
                  <CheckBox id="restrictionarea" />
                </IonItem>
                <IonItem>
                  <IonLabel>{t('homePage.map.controls.layer.specialAreas')}</IonLabel>
                  <CheckBox id="specialarea" />
                </IonItem>
                <IonItem>
                  <IonLabel>{t('homePage.map.controls.layer.pilotPlaces')}</IonLabel>
                  <CheckBox id="pilot" />
                </IonItem>
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
      </>
    </IonModal>
  );
};

export default LayerModal;
