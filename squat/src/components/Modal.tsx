import React, { ReactElement, useState } from 'react';
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

  return (
    <>
      <IonButton
        fill="clear"
        className="icon-only"
        onClick={() => setIsOpen(true)}
        title={props.triggerTitle || t('more-info')}
        aria-label={props.triggerTitle || t('more-info')}
        role="button"
      >
        {props.trigger || <IonIcon color="primary" slot="icon-only" icon={helpCircleOutline} />}
      </IonButton>
      <IonModal isOpen={isOpen} className={props.size ? props.size : 'medium'}>
        <IonHeader>
          <div className="gradient-top" />
          <IonToolbar>
            <IonTitle>{props.title}</IonTitle>
            <IonButtons slot="end" style={{ 'margin-right': '16px' }}>
              <IonButton onClick={() => setIsOpen(false)} className="icon-only">
                <IonIcon slot="icon-only" icon={closeOutline} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent>{props.content}</IonContent>
        <IonFooter>
          <IonToolbar className="buttonBar">
            <IonButton slot="end" size="large" onClick={() => setIsOpen(false)} shape="round">
              {t('close')}
            </IonButton>
          </IonToolbar>
        </IonFooter>
      </IonModal>
    </>
  );
};

export default Modal;
