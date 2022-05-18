import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { useTranslation } from "react-i18next";
import Squat from '../components/Squat';
import './Home.css';

const Home: React.FC = () => {
  const { t } = useTranslation();
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>{t("homePage.header.title")}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <Squat />
      </IonContent>
    </IonPage>
  );
};

export default Home;
