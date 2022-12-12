import React, { useRef } from 'react';
import { IonContent, IonPage, useIonViewWillEnter } from '@ionic/react';
import dvkMap from '../components/DvkMap';
import { RouteComponentProps } from 'react-router-dom';
import { unsetSelectedFairwayCard } from '../components/layers';
import { useTranslation } from 'react-i18next';

// eslint-disable-next-line
interface HomeProps extends RouteComponentProps {}

const Home: React.FC<HomeProps> = ({ history }) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });
  const mapElement = useRef<HTMLDivElement | null>(null);

  document.title = t('documentTitle');

  useIonViewWillEnter(() => {
    unsetSelectedFairwayCard();
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

export default Home;
