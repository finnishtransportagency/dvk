import React, { ReactElement, useCallback, useState } from 'react';
import { IonButton, IonButtons, IonContent, IonFooter, IonHeader, IonIcon, IonModal, IonTitle, IonToolbar } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { closeOutline, helpCircleOutline } from 'ionicons/icons';

interface ModalProps {
  title: string;
  content: string | ReactElement;
  trigger?: ReactElement;
  triggerTitle?: string;
  size?: 'medium' | 'large';
}

const Modal: React.FC<ModalProps> = (props) => {
  const { t } = useTranslation('', { keyPrefix: 'common' });
  const [isOpen, setIsOpen] = useState(false);

  const handleClickOpen = useCallback(() => {
    setIsOpen(true);
  }, []);

  const handleClickClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <>
      <IonButton
        fill="clear"
        className="icon-only no-background-focused"
        style={{ marginTop: '1px', marginRight: '1px', marginBottom: '1px' }}
        onClick={handleClickOpen}
        title={props.triggerTitle || t('more-info')}
        aria-label={props.triggerTitle || t('more-info')}
        role="button"
      >
        {props.trigger || <IonIcon color="primary" slot="icon-only" icon={helpCircleOutline} />}
      </IonButton>
      <IonModal isOpen={isOpen} className={props.size ? props.size : 'medium'} onDidDismiss={handleClickClose} mode="md">
        <IonHeader>
          <div className="gradient-top" />
          <IonToolbar>
            <IonTitle>
              <div className="wrappable-title">{props.title}</div>
            </IonTitle>
            <IonButtons slot="end" style={{ marginRight: '16px' }}>
              <IonButton onClick={handleClickClose} className="icon-only" title={t('close-dialog')} aria-label={t('close-dialog')}>
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
