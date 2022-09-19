import React, { ReactElement, useState } from 'react';
import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonItem, IonModal, IonTitle, IonToolbar } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { closeOutline, helpCircleOutline } from 'ionicons/icons';

interface ModalProps {
  title: string;
  content: string | ReactElement;
  trigger?: ReactElement;
  triggerTitle?: string;
}

const Modal: React.FC<ModalProps> = (props) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <IonButton
        fill="clear"
        className="icon-only"
        onClick={() => setIsOpen(true)}
        title={props.triggerTitle || t('common.more-info')}
        aria-label={props.triggerTitle || t('common.more-info')}
      >
        {props.trigger || <IonIcon color="primary" slot="icon-only" icon={helpCircleOutline} />}
      </IonButton>
      <IonModal isOpen={isOpen}>
        <IonHeader>
          <div className="gradient-top" />
          <IonToolbar>
            <IonTitle>{props.title}</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={() => setIsOpen(false)} className="icon-only">
                <IonIcon slot="icon-only" icon={closeOutline} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          {props.content}
          <IonItem lines="none" className="no-padding top-padding">
            <IonButton slot="end" size="default" onClick={() => setIsOpen(false)} shape="round">
              {t('common.close')}
            </IonButton>
          </IonItem>
        </IonContent>
      </IonModal>
    </>
  );
};

export default Modal;
