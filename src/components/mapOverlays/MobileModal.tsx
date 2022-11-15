import { IonButton, IonButtons, IonContent, IonFooter, IonHeader, IonIcon, IonModal, IonTitle, IonToolbar, isPlatform } from '@ionic/react';
import { closeOutline } from 'ionicons/icons';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export const MobileModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(isPlatform('mobileweb'));
  const { t } = useTranslation();
  return (
    <IonModal isOpen={isOpen} className="small" onDidDismiss={() => setIsOpen(false)} mode="md">
      <IonHeader>
        <div className="gradient-top" />
        <IonToolbar>
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
      <IonContent>
        <div className="wrappable-title">{t('mobile.content')}</div>
      </IonContent>
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
