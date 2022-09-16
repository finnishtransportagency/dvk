import React from 'react';
import { IonCheckbox, IonItem, IonLabel, IonList, IonModal } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import './LayerModal.css';

interface ModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const LayerModal: React.FC<ModalProps> = ({ isOpen, setIsOpen }) => {
  const { t } = useTranslation();
  return (
    <IonModal id="layerModalContainer" isOpen={isOpen} onDidDismiss={() => setIsOpen(false)}>
      <div className="wrapper">
        <h1>{t('homePage.map.controls.layer.header')}</h1>
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
      </div>
    </IonModal>
  );
};

export default LayerModal;
