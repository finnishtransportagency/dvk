import React, { useEffect } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import MainContent from '../components/content/MainContent';
import { useDocumentTitle } from '../hooks/dvkDocumentTitle';

const SafetyEquipmentFaultPage: React.FC = () => {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'common' });
  const tRoot = i18n.getFixedT(i18n.language);
  const title = t('documentTitle') + ' - ' + tRoot('homePage.sidebarMenu.safety-equipment-faults');
  const [, setDocumentTitle] = useDocumentTitle(title);

  useEffect(() => {
    setDocumentTitle(title);
  }, [setDocumentTitle, title]);

  return (
    <IonPage id="mainContent">
      <IonContent>
        <MainContent splitPane target="faults" />
      </IonContent>
    </IonPage>
  );
};

export default SafetyEquipmentFaultPage;
