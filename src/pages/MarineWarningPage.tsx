import React, { useEffect } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import MainContent from '../components/content/MainContent';
import { useDocumentTitle } from '../hooks/dvkDocumentTitle';

const MarineWarningPage: React.FC = () => {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'common' });
  const tRoot = i18n.getFixedT(i18n.language);
  const title = t('documentTitle') + ' - ' + tRoot('homePage.sidebarMenu.marine-warnings');
  const [, setDoucmentTitle] = useDocumentTitle(title);

  useEffect(() => {
    setDoucmentTitle(title);
  }, [setDoucmentTitle, title]);

  return (
    <IonPage id="mainContent">
      <IonContent>
        <MainContent splitPane target="warnings" />
      </IonContent>
    </IonPage>
  );
};

export default MarineWarningPage;
