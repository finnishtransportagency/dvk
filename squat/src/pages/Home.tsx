import React from 'react';
import { IonContent, IonHeader, IonPage, IonSelect, IonSelectOption, IonTitle, IonToolbar } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import Squat from '../components/Squat';
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
      </IonContent>
    </IonPage>
  );
};

export default Home;
