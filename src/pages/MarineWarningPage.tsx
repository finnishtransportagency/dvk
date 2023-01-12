import React from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import MainContent from '../components/content/MainContent';

const MarineWarningPage: React.FC = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'common' });
  document.title = t('documentTitle');

  return (
    <IonPage id="mainContent">
      <IonContent>
        <MainContent splitPane target="warnings" />
      </IonContent>
    </IonPage>
  );
};

export default MarineWarningPage;
