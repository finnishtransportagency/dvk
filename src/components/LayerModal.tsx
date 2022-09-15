import React from 'react';
import { IonCheckbox, IonItem, IonLabel, IonList, IonModal } from '@ionic/react';
import { useTranslation } from 'react-i18next';

interface ModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const LayerModal: React.FC<ModalProps> = ({ isOpen, setIsOpen }) => {
  const { t } = useTranslation();
  return (
    <IonModal isOpen={isOpen} onDidDismiss={() => setIsOpen(false)}>
      <div className="wrapper">
        <h1>{t('homePage.map.controls.layer.header')}</h1>
        <IonList lines="none">
          <IonItem button={true} detail={false}>
            <IonCheckbox slot="start" />
            <IonLabel>{t('homePage.map.controls.layer.fairways')}</IonLabel>
          </IonItem>
          <IonItem button={true} detail={false}>
            <IonCheckbox slot="start" />
            <IonLabel>{t('homePage.map.controls.layer.fairwayAreas')}</IonLabel>
          </IonItem>
          <IonItem button={true} detail={false}>
            <IonCheckbox slot="start" />
            <IonLabel>{t('homePage.map.controls.layer.safetyEquipments')}</IonLabel>
          </IonItem>
          <IonItem button={true} detail={false}>
            <IonCheckbox slot="start" />
            <IonLabel>{t('homePage.map.controls.layer.speedLimits')}</IonLabel>
          </IonItem>
          <IonItem button={true} detail={false}>
            <IonCheckbox slot="start" />
            <IonLabel>{t('homePage.map.controls.layer.specialAreas')}</IonLabel>
          </IonItem>
          <IonItem button={true} detail={false}>
            <IonCheckbox slot="start" />
            <IonLabel>{t('homePage.map.controls.layer.pilotPlaces')}</IonLabel>
          </IonItem>
        </IonList>
      </div>
    </IonModal>
  );
};

export default LayerModal;
