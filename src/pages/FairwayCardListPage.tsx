import React, { useEffect } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import MainContent from '../components/content/MainContent';
import { useDocumentTitle } from '../hooks/dvkDocumentTitle';

const FairwayCardListPage: React.FC = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'common' });
  const title = t('documentTitle');
  const [, setDocumentTitle] = useDocumentTitle(title);

  useEffect(() => {}, [setDocumentTitle, title]);

  return (
    <IonPage id="mainContent" data-testid="fairwayList">
      <IonContent>
        <MainContent splitPane />
      </IonContent>
    </IonPage>
  );
};

export default FairwayCardListPage;
