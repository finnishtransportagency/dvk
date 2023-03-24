import { IonButton, IonCol, IonFooter, IonGrid, IonHeader, IonModal, IonRow, IonText, IonTitle, IonToolbar } from '@ionic/react';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ReactComponent as CloseIcon } from '../theme/img/close_black_24dp.svg';

interface ModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  title: string;
  description: string;
  buttonTitle: string;
  action: () => void;
}

const ConfirmationModal: React.FC<ModalProps> = ({ isOpen, setIsOpen, title, description, buttonTitle, action }) => {
  const { t } = useTranslation();

  const modal = useRef<HTMLIonModalElement>(null);

  const closeModal = () => {
    setIsOpen(false);
    modal.current?.dismiss();
  };
  const buttonAction = () => {
    modal.current?.dismiss();
    action();
  };

  return (
    <IonModal ref={modal} isOpen={isOpen} className="prompt" onDidDismiss={() => closeModal()}>
      <IonHeader>
        <div className="gradient-top" />
        <IonToolbar className="titleBar">
          <IonTitle>
            <div className="wrappable-title">{title}</div>
          </IonTitle>
          <IonButton
            slot="end"
            onClick={() => closeModal()}
            fill="clear"
            className="closeButton"
            title={t('general.close') || ''}
            aria-label={t('general.close') || ''}
          >
            <CloseIcon />
          </IonButton>
        </IonToolbar>
      </IonHeader>
      <IonGrid>
        <IonRow className="content">
          <IonCol>
            <IonText>
              <p>{description}</p>
            </IonText>
          </IonCol>
        </IonRow>
      </IonGrid>
      <IonFooter>
        <IonToolbar className="buttonBar">
          <IonButton slot="end" size="large" onClick={() => closeModal()} shape="round" className="invert">
            {t('general.cancel')}
          </IonButton>
          <IonButton slot="end" size="large" onClick={() => buttonAction()} shape="round">
            {buttonTitle}
          </IonButton>
        </IonToolbar>
      </IonFooter>
    </IonModal>
  );
};

export default ConfirmationModal;
