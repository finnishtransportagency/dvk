import { IonButton, IonCol, IonFooter, IonGrid, IonHeader, IonModal, IonRow, IonText, IonTitle, IonToolbar } from '@ionic/react';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import CloseIcon from '../theme/img/close_black_24dp.svg?react';

interface ModalProps {
  isOpen: boolean;
  closeAction: () => void;
  closeTitle: string;
  header: string;
  subHeader?: string;
  message: string;
  itemList?: string[];
}

const NotificationModal: React.FC<ModalProps> = ({ isOpen, closeAction, closeTitle, header, subHeader, message, itemList }) => {
  const { t } = useTranslation();

  const modal = useRef<HTMLIonModalElement>(null);

  const closeModal = () => {
    modal.current?.dismiss().catch((err) => console.error(err));
    setTimeout(() => {
      closeAction();
    }, 150);
  };

  return (
    <IonModal ref={modal} isOpen={isOpen} className="prompt" onDidDismiss={() => closeModal()}>
      <IonHeader>
        <div className="gradient-top" />
        <IonToolbar className="titleBar">
          <IonTitle>
            <div className="wrappable-title">{header || subHeader}</div>
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
              {header && subHeader && <p>{subHeader}</p>}
              <p>{message}</p>
              {itemList && (
                <ul>
                  {itemList.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </IonText>
          </IonCol>
        </IonRow>
      </IonGrid>
      <IonFooter>
        <IonToolbar className="buttonBar">
          <IonButton slot="end" onClick={() => closeModal()} shape="round" aria-label={closeTitle}>
            {closeTitle}
          </IonButton>
        </IonToolbar>
      </IonFooter>
    </IonModal>
  );
};

export default NotificationModal;
