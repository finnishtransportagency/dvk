import React from 'react';
import { IonContent, IonFooter, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import Squat from '../components/Squat';
import SquatChart from '../components/SquatChart';

export const showLanguages = (): boolean => {
  const urlParams = new URLSearchParams(window.location.search);
  const sh = urlParams.get('showLanguages');
  return sh && sh === 'false' ? false : true;
};

const Home: React.FC = () => {
  return (
    <IonPage>
      <IonContent>
        <Squat />
        <SquatChart />
      </IonContent>
      {/*-- Fade Footer --*/}
      <IonFooter collapse="fade" className="small">
        <IonToolbar>
          <IonTitle size="small" slot="end" className="version-title">
            v{`${process.env.REACT_APP_VERSION}`}
          </IonTitle>
        </IonToolbar>
      </IonFooter>
    </IonPage>
  );
};

export default Home;
