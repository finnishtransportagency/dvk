import { IonCol, IonIcon } from '@ionic/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import infoIcon from '../../theme/img/info.svg';
import { MarineWarningModal } from './MarineWarningModal';
import './MarineWarningModal.css';

interface ModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const MarineWarningInfoModal: React.FC<ModalProps> = ({ isOpen, setIsOpen }) => {
  const { t } = useTranslation();
  return (
    <MarineWarningModal isOpen={isOpen} setIsOpen={setIsOpen} className="marineWarningInfo">
      <IonCol size="auto" className="ion-align-self-center">
        <IonIcon className="infoIcon" icon={infoIcon} />
      </IonCol>
      <IonCol>
        <strong>{t('warnings.note')}</strong> {t('warnings.notification')}
      </IonCol>
    </MarineWarningModal>
  );
};
