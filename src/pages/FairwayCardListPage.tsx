import React, { useEffect } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import MainContent from '../components/MainContent';
import { useFairwayCardListData } from '../utils/dataLoader';

const FairwayCardListPage: React.FC = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });
  document.title = t('documentTitle');
  const { data } = useFairwayCardListData();

  useEffect(() => {}, [data]);

  return (
    <IonPage id="mainContent" data-testid="fairwayList">
      <IonContent>
        <MainContent splitPane />;
      </IonContent>
    </IonPage>
  );
};

export default FairwayCardListPage;
