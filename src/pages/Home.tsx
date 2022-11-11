import React, { useRef } from 'react';
import { IonContent, IonPage, useIonViewWillEnter } from '@ionic/react';
import dvkMap from '../components/DvkMap';
import { RouteComponentProps } from 'react-router-dom';

// eslint-disable-next-line
interface HomeProps extends RouteComponentProps {}

const Home: React.FC<HomeProps> = ({ history }) => {
  const mapElement = useRef<HTMLDivElement | null>(null);

  useIonViewWillEnter(() => {
    if (mapElement?.current) {
      dvkMap.addShowSidebarMenuControl();
      dvkMap.addSearchbarControl();
      dvkMap.setTarget(mapElement.current);
      dvkMap.setHistory(history);
    }
  });

  return (
    <IonPage>
      <IonContent className="ion-no-padding">
        <div ref={mapElement} data-testid="homeMap"></div>
      </IonContent>
    </IonPage>
  );
};

export default Home;
