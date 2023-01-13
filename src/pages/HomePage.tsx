import React, { useRef } from 'react';
import { IonContent, IonPage, useIonViewWillEnter } from '@ionic/react';
import dvkMap from '../components/DvkMap';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const HomePage: React.FC = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'common' });
  const mapElement = useRef<HTMLDivElement | null>(null);
  const history = useHistory();
  document.title = t('documentTitle');

  useIonViewWillEnter(() => {
    if (mapElement?.current) {
      dvkMap.addShowSidebarMenuControl();
      dvkMap.addSearchbarControl();
      dvkMap.addLayerPopupControl();
      dvkMap.addCenterToOwnLocationControl();
      dvkMap.addZoomControl();
      dvkMap.setTarget(mapElement.current);
      dvkMap.setHistory(history);
    }
  });

  return (
    <IonPage>
      <IonContent className="ion-no-padding">
        <div className="mainMapWrapper" ref={mapElement} data-testid="homeMap"></div>
      </IonContent>
    </IonPage>
  );
};

export default HomePage;
