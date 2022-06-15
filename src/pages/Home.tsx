import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButtons, IonButton } from '@ionic/react';
import Map from '../components/Map';
import { useTranslation } from 'react-i18next';
import './Home.css';

const Home: React.FC = () => {
  const { t, i18n } = useTranslation();
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>{t('homePage.header.title')}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => i18n.changeLanguage('fi')}>FI</IonButton>
            <IonButton onClick={() => i18n.changeLanguage('en')}>EN</IonButton>
            <IonButton onClick={() => i18n.changeLanguage('sv')}>SV</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <Map />
      </IonContent>
    </IonPage>
  );
};

export default Home;
