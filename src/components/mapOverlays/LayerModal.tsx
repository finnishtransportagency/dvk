import React, { useState } from 'react';
import { IonCheckbox, IonCol, IonRow, IonGrid, IonItem, IonLabel, IonList, IonModal, IonText } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { BackgroundMapType } from '../DvkMap';
import './LayerModal.css';

interface ModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  bgMapType: BackgroundMapType;
  setBgMapType: (bgMapType: BackgroundMapType) => void;
}

const LayerModal: React.FC<ModalProps> = ({ isOpen, setIsOpen, bgMapType, setBgMapType }) => {
  const { t } = useTranslation();
  const [bgMap, setBgMap] = useState<BackgroundMapType>(bgMapType);

  const setBackgroundMap = (type: BackgroundMapType) => {
    setBgMapType(type);
    setBgMap(type);
  };

  return (
    <IonModal
      id="layerModalContainer"
      isOpen={isOpen}
      onDidDismiss={() => {
        setIsOpen(false);
      }}
    >
      <div className="wrapper">
        <b>{t('homePage.map.controls.layer.header')}</b>
        <IonList lines="none">
          <IonItem>
            <IonLabel>{t('homePage.map.controls.layer.fairways')}</IonLabel>
            <IonCheckbox slot="start" />
          </IonItem>
          <IonItem>
            <IonLabel>{t('homePage.map.controls.layer.fairwayAreas')}</IonLabel>
            <IonCheckbox slot="start" />
          </IonItem>
          <IonItem>
            <IonLabel>{t('homePage.map.controls.layer.depths')}</IonLabel>
            <IonCheckbox slot="start" />
          </IonItem>
          <IonItem>
            <IonLabel>{t('homePage.map.controls.layer.safetyEquipments')}</IonLabel>
            <IonCheckbox slot="start" />
          </IonItem>
          <IonItem>
            <IonLabel>{t('homePage.map.controls.layer.speedLimits')}</IonLabel>
            <IonCheckbox slot="start" />
          </IonItem>
          <IonItem>
            <IonLabel>{t('homePage.map.controls.layer.specialAreas')}</IonLabel>
            <IonCheckbox slot="start" />
          </IonItem>
          <IonItem>
            <IonLabel>{t('homePage.map.controls.layer.pilotPlaces')}</IonLabel>
            <IonCheckbox slot="start" />
          </IonItem>
        </IonList>
        <IonGrid>
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
      </div>
    </IonModal>
  );
};

export default LayerModal;
