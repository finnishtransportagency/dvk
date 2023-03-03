import { IonButton, IonButtons, IonCol, IonFooter, IonGrid, IonHeader, IonIcon, IonModal, IonRow, IonTitle, IonToolbar } from '@ionic/react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageBar } from '../SidebarMenu';
import './MobileModal.css';

type ModalProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  languageBar: boolean;
  title: string;
  content: string;
};

const Modal: React.FC<ModalProps> = ({ isOpen, setIsOpen, languageBar, title, content }) => {
  const { t } = useTranslation();
  return (
    <IonModal isOpen={isOpen} className="small" onDidDismiss={() => setIsOpen(false)}>
      <IonHeader>
        <div className="gradient-top" />
        <IonToolbar className="titleBar">
          <IonTitle>
            <div className="wrappable-title">{title}</div>
          </IonTitle>
          <IonButtons slot="end" style={{ marginRight: '16px' }}>
            <IonButton
              onClick={() => setIsOpen(false)}
              fill="clear"
              className="closeButton"
              title={t('common.close-dialog')}
              aria-label={t('common.close-dialog')}
            >
              <IonIcon className="otherIconLarge" src="assets/icon/close_black_24dp.svg" />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonGrid>
        <IonRow className="content">
          <IonCol>{content}</IonCol>
        </IonRow>
        {languageBar && (
          <IonRow className="languageBar">
            <IonCol>
              <LanguageBar />
            </IonCol>
          </IonRow>
        )}
      </IonGrid>
      <IonFooter>
        <IonToolbar className="buttonBar">
          <IonButton slot="end" size="large" onClick={() => setIsOpen(false)} shape="round">
            {t('common.close')}
          </IonButton>
        </IonToolbar>
      </IonFooter>
    </IonModal>
  );
};

export const MobileModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(process.env.NODE_ENV !== 'production' ? true : false);
  const { t } = useTranslation();
  return <Modal isOpen={isOpen} setIsOpen={setIsOpen} languageBar={true} title={t('mobile.title')} content={t('mobile.content')} />;
};

type SourceModalProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

export const SourceModal: React.FC<SourceModalProps> = ({ isOpen, setIsOpen }) => {
  const { t } = useTranslation();
  return <Modal isOpen={isOpen} setIsOpen={setIsOpen} languageBar={true} title={t('source.title')} content={t('source.content')} />;
};
