import { IonButton, IonCol, IonFooter, IonGrid, IonHeader, IonModal, IonRow, IonText, IonTitle, IonToolbar } from '@ionic/react';
import React, { Dispatch, SetStateAction, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import CloseIcon from '../theme/img/close_black_24dp.svg?react';
import { ConfirmationType } from '../../utils/constants';

interface ModalProps {
  confirmationType: ConfirmationType;
  setActionPending: Dispatch<SetStateAction<boolean>>;
  handlePublish: () => void;
}

const PublishDetailsModal: React.FC<ModalProps> = ({ confirmationType, setActionPending, handlePublish }) => {
  const { t } = useTranslation();
  const modal = useRef<HTMLIonModalElement>(null);

  const closeModal = () => {
    modal.current?.dismiss().catch((err) => console.error(err));
  };

  const cancelAction = () => {
    setActionPending(false);
    closeModal();
  };

  return (
    <IonModal ref={modal} isOpen={confirmationType !== ''} className="prompt" onDidDismiss={() => closeModal()}>
      <IonHeader>
        <div className="gradient-top" />
        <IonToolbar className="titleBar">
          <IonTitle>
            <div className="wrappable-title">{t('')}</div>
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
            <IonText>
              <p>terve</p>
            </IonText>
          </IonCol>
        </IonRow>
      </IonGrid>
      <IonFooter>
        <IonToolbar className="buttonBar">
          <IonButton slot="end" onClick={() => cancelAction()} shape="round" className="invert">
            {t('general.cancel')}
          </IonButton>
          <IonButton slot="end" onClick={() => handlePublish()} shape="round">
            {t('general.publish')}
          </IonButton>
        </IonToolbar>
      </IonFooter>
    </IonModal>
  );
};

export default PublishDetailsModal;