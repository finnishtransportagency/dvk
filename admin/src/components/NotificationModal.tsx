import { IonButton, IonCol, IonFooter, IonGrid, IonHeader, IonModal, IonRow, IonText, IonTitle, IonToolbar } from '@ionic/react';
import React, { useRef } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import CloseIcon from '../theme/img/close_black_24dp.svg?react';

interface ModalProps {
  isOpen: boolean;
  closeAction: () => void;
  closeTitle: string;
  header: string;
  subHeader?: string;
  message?: string;
  itemList?: string[];
  i18nkey?: string;
  // used when harbor is tried to get archived and there's still linked fairway card(s)
  targetName?: string;
}

const NotificationModal: React.FC<ModalProps> = ({ isOpen, closeAction, closeTitle, header, subHeader, message, itemList, i18nkey, targetName }) => {
  const { t } = useTranslation();

  const modal = useRef<HTMLIonModalElement>(null);
  const messages = message?.split('\n') ?? [];

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
              {i18nkey && (
                /*Changed because of bold text needed for notices modal, but components part can be refactored if more diverse need arises*/
                <p>
                  <Trans t={t} i18nKey={i18nkey} components={{ strong: <strong />, span: <span /> }} />
                </p>
              )}
              {messages?.map((str, i) => <p key={`${i}-${str.length}`}>{str}</p>)}
              {itemList && (
                <>
                  <div>
                    <Trans
                      t={t}
                      i18nKey={t('modal.archive-harbor-linked-fairwayCards', { name: targetName })}
                      components={{ strong: <strong />, span: <span /> }}
                    />
                  </div>
                  <ul>
                    {itemList.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </>
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
