import React from 'react';
import { IonContent, IonFooter, IonHeader, IonPage, IonSelect, IonSelectOption, IonTitle, IonToolbar } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import Squat from '../components/Squat';
import SquatChart from '../components/SquatChart';
import './Home.css';

const Home: React.FC = () => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>{t('homePage.header.title')}</IonTitle>
          <IonSelect slot="end" value={i18n.language} className="ion-padding" onIonChange={(e) => changeLanguage(e.detail.value)}>
            <IonSelectOption value="fi">fi</IonSelectOption>
            <IonSelectOption value="sv">sv</IonSelectOption>
            <IonSelectOption value="en">en</IonSelectOption>
          </IonSelect>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
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
