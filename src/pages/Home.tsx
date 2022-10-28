import React, { useRef } from 'react';
import { IonContent, IonPage, useIonViewWillEnter } from '@ionic/react';
import dvkMap from '../components/DvkMap';

const Home = (): JSX.Element => {
  const mapElement = useRef<HTMLDivElement | null>(null);

  useIonViewWillEnter(() => {
    if (mapElement?.current) {
      dvkMap.addShowSidebarMenuControl();
      dvkMap.addSearchbarControl();
      dvkMap.setTarget(mapElement.current);
    }
  });

  return (
    <IonPage>
      <IonContent className="ion-no-padding">
        <div ref={mapElement}></div>
      </IonContent>
    </IonPage>
  );
};

export default Home;
