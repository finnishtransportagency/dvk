import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import Squat from '../components/Squat';
import './Home.css';

const Home: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Squat-laskenta</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <Squat />
      </IonContent>
    </IonPage>
  );
};

export default Home;
