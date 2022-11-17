import {
  IonButton,
  IonButtons,
  IonCol,
  IonFooter,
  IonGrid,
  IonHeader,
  IonIcon,
  IonModal,
  IonRow,
  IonTitle,
  IonToolbar,
  isPlatform,
} from '@ionic/react';
import { closeOutline } from 'ionicons/icons';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageBar } from '../SidebarMenu';
import './MobileModal.css';

function isMobile() {
  return isPlatform('iphone') || isPlatform('android');
}

export const MobileModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(isMobile());
  const { t } = useTranslation();
  return (
    <IonModal isOpen={isOpen} className="small" onDidDismiss={() => setIsOpen(false)} mode="md">
      <IonHeader>
        <div className="gradient-top" />
        <IonToolbar className="titleBar">
          <IonTitle>
            <div className="wrappable-title">{t('mobile.title')}</div>
          </IonTitle>
          <IonButtons className="no-background-focused" slot="end" style={{ marginRight: '16px' }}>
            <IonButton onClick={() => setIsOpen(false)} className="icon-only" title={t('common.close-dialog')} aria-label={t('common.close-dialog')}>
              <IonIcon slot="icon-only" icon={closeOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonGrid>
        <IonRow className="content">
          <IonCol>{t('mobile.content')}</IonCol>
        </IonRow>
        <IonRow>
          <IonCol>
            <LanguageBar />
          </IonCol>
        </IonRow>
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
