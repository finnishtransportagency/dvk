import React from 'react';
import { IonContent, IonFooter, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import Squat from '../components/Squat';
import SquatChart from '../components/SquatChart';

export const showHeader = (): boolean => {
  const urlParams = new URLSearchParams(window.location.search);
  const sh = urlParams.get('showHeader');
  return sh && sh === 'false' ? false : true;
};

const Home: React.FC = () => {
  const { t } = useTranslation();

  return (
    <IonPage>
      {showHeader() && (
        <IonHeader>
          <IonToolbar color="primary">
            <IonTitle>{t('homePage.header.title')}</IonTitle>
          </IonToolbar>
        </IonHeader>
      )}
      <IonContent>
        <Squat />
        <SquatChart />
      </IonContent>
      {/*-- Fade Footer --*/}
      <IonFooter collapse="fade" className="small">
        <IonToolbar>
          <IonTitle size="small" slot="end">
            <small>v{`${process.env.REACT_APP_VERSION}`}</small>
          </IonTitle>
        </IonToolbar>
      </IonFooter>
    </IonPage>
  );
};

export default Home;
