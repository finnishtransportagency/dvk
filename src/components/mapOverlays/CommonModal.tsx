import { IonButton, IonButtons, IonCol, IonFooter, IonGrid, IonHeader, IonIcon, IonModal, IonRow, IonTitle, IonToolbar } from '@ionic/react';
import React, { ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageBar } from '../SidebarMenu';
import './CommonModal.css';

type ModalProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  title: string;
  showBackdrop: boolean;
  size: string;
  children: ReactElement;
};

const Modal: React.FC<ModalProps> = ({ isOpen, setIsOpen, title, showBackdrop, size, children }) => {
  const { t } = useTranslation();
  return (
    <IonModal isOpen={isOpen} className={size} showBackdrop={showBackdrop} onDidDismiss={() => setIsOpen(false)}>
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
      {children}
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
  const [isOpen, setIsOpen] = useState(process.env.NODE_ENV === 'production' ? true : false);
  const { t } = useTranslation();
  return (
    <Modal size="small" showBackdrop={true} isOpen={isOpen} setIsOpen={setIsOpen} title={t('mobile.title')}>
      <IonGrid>
        <IonRow className="content">
          <IonCol>{t('mobile.content')}</IonCol>
        </IonRow>
        <IonRow className="languageBar">
          <IonCol>
            <LanguageBar />
          </IonCol>
        </IonRow>
      </IonGrid>
    </Modal>
  );
};

type SourceModalProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

export const SourceModal: React.FC<SourceModalProps> = ({ isOpen, setIsOpen }) => {
  const { t } = useTranslation();
  return (
    <Modal size="large" showBackdrop={false} isOpen={isOpen} setIsOpen={setIsOpen} title={t('source.title')}>
      <IonGrid className="linkBar">
        <IonRow className="content">
          <IonCol> {t('source.content1')}</IonCol>
        </IonRow>
        <IonRow className="content">
          <IonCol> {t('source.content2')}</IonCol>
        </IonRow>
        <IonRow className="content">
          <IonCol>
            <a href="http://creativecommons.org/licenses/by/4.0/deed.fi" rel="noreferrer" target="_blank" className="ion-no-padding external">
              http://creativecommons.org/licenses/by/4.0/deed.fi
            </a>{' '}
            {t('source.content3')}
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol>
            {t('source.content4')}
            {' | '}
            <a href="https://www.maanmittauslaitos.fi/avoindata-lisenssi-cc40" rel="noreferrer" target="_blank" className="ion-no-padding external">
              {t('source.content5')}
            </a>
          </IonCol>
        </IonRow>
      </IonGrid>
    </Modal>
  );
};
