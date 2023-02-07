import React, { useEffect } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import MainContent from '../components/content/MainContent';
import { useDocumentTitle } from '../hooks/dvkDocumentTitle';

const MarineWarningPage: React.FC = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'common' });
  const title = t('documentTitle') + ' - ' + t('marine-warnings');
  const [, setDocumentTitle] = useDocumentTitle(title);

  useEffect(() => {
    setDocumentTitle(title);
  }, [setDocumentTitle, title]);

  return (
    <IonPage id="mainContent">
      <IonContent>
        <MainContent splitPane target="warnings" />
      </IonContent>
    </IonPage>
  );
};

export default MarineWarningPage;
