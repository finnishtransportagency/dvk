import React, { useRef } from 'react';
import { IonButton, IonCol, IonFooter, IonGrid, IonHeader, IonModal, IonRow, IonTitle, IonToolbar } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import CloseIcon from '../theme/img/close_black_24dp.svg?react';
import { Orientation } from '../graphql/generated';
import { PrintInfo } from './pictures/PrintInfo';

interface ModalProps {
  orientation: Orientation | '';
  setIsOpen: (orientation: Orientation | '') => void;
}

const HelpModal: React.FC<ModalProps> = ({ orientation, setIsOpen }) => {
  const { t } = useTranslation();

  const modal = useRef<HTMLIonModalElement>(null);

  const closeModal = () => {
    modal.current?.dismiss().catch((err) => console.error(err));
    setTimeout(() => {
      setIsOpen('');
    }, 150);
  };

  return (
    <IonModal ref={modal} isOpen={!!orientation} className="prompt" onDidDismiss={() => closeModal()}>
      <IonHeader>
        <div className="gradient-top" />
        <IonToolbar className="titleBar">
          <IonTitle>
            <div className="wrappable-title">{t('modal.help-title-' + orientation)}</div>
          </IonTitle>
          <IonButton
            slot="end"
            onClick={() => closeModal()}
            fill="clear"
            className="closeButton"
            title={t('general.close') ?? ''}
            aria-label={t('general.close') ?? ''}
          >
            <CloseIcon />
          </IonButton>
        </IonToolbar>
      </IonHeader>
      <IonGrid>
        <IonRow className="content">
          <IonCol>
            <PrintInfo orientation={orientation || Orientation.Portrait} />
          </IonCol>
        </IonRow>
      </IonGrid>
      <IonFooter>
        <IonToolbar className="buttonBar">
          <IonButton slot="end" onClick={() => closeModal()} shape="round">
            {t('general.close')}
          </IonButton>
        </IonToolbar>
      </IonFooter>
    </IonModal>
  );
};

export default HelpModal;
