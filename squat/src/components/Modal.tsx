import React, { ReactElement, useCallback, useState } from 'react';
import { IonButton, IonButtons, IonContent, IonFooter, IonHeader, IonIcon, IonModal, IonTitle, IonToolbar } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { closeOutline, helpCircleOutline } from 'ionicons/icons';

interface ModalProps {
  title: string;
  content: string | ReactElement;
  triggerIcon?: ReactElement;
  triggerTitle?: string;
  triggerClassName?: string;
  size?: 'medium' | 'large';
  handleDismiss?: () => void;
  disabled?: boolean;
}

const Modal: React.FC<ModalProps> = (props) => {
  const { t } = useTranslation('', { keyPrefix: 'common' });
  const [isOpen, setIsOpen] = useState(false);

  const handleClickOpen = useCallback(() => {
    setIsOpen(true);
  }, []);

  const handleClickClose = useCallback(() => {
    setIsOpen(false);
    if (props.handleDismiss) props.handleDismiss();
  }, [props]);

  return (
    <>
      <IonButton
        fill="clear"
        className={'icon-only ' + (props.triggerClassName ? ' ' + props.triggerClassName : '')}
        onClick={handleClickOpen}
        title={props.triggerTitle ?? t('more-info')}
        aria-label={props.triggerTitle ?? t('more-info')}
        disabled={props.disabled}
      >
        {props.triggerIcon ?? <IonIcon color="primary" slot="icon-only" aria-label={t('more-info')} icon={helpCircleOutline} />}
      </IonButton>
      <IonModal isOpen={isOpen} className={'squatModal ' + (props.size ? props.size : 'medium')} onDidDismiss={handleClickClose}>
        <IonHeader>
          <div className="gradient-top" />
          <IonToolbar>
            <IonTitle>
              <div className="wrappable-title">{props.title}</div>
            </IonTitle>
            <IonButtons slot="end" style={{ marginRight: '16px' }}>
              <IonButton
                onClick={handleClickClose}
                className="icon-only no-background-focused"
                title={t('close-dialog')}
                aria-label={t('close-dialog')}
              >
                <IonIcon slot="icon-only" icon={closeOutline} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent>{props.content}</IonContent>
        <IonFooter>
          <IonToolbar className="buttonBar">
            <IonButton slot="end" size="large" onClick={handleClickClose} shape="round">
              {t('close')}
            </IonButton>
          </IonToolbar>
        </IonFooter>
      </IonModal>
    </>
  );
};

export default Modal;
