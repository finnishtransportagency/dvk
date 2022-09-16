import React from 'react';
import { IonContent, IonPage } from '@ionic/react';
import MapContainer from '../components/MapContainer';
import './Home.css';

const Home: React.FC = () => {
  return (
    <IonPage>
      <IonContent className="ion-no-padding">
        <MapContainer />
      </IonContent>
    </IonPage>
  );
};

export default Home;
