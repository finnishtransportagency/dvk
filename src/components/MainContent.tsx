import React, { useRef, useState } from 'react';
import { IonCol, IonContent, IonGrid, IonInput, IonPage, IonRow, useIonViewWillEnter } from '@ionic/react';
import { ReactComponent as ChevronIcon } from '../theme/img/chevron.svg';
import { ReactComponent as MenuIcon } from '../theme/img/menu.svg';
import { menuController } from '@ionic/core/components';
import { useTranslation } from 'react-i18next';
import './FairwayCards.css';
import { RouteComponentProps } from 'react-router-dom';
import FairwayCards from './FairwayCards';
import FairwayCard from './FairwayCard';
import dvkMap from '../components/DvkMap';

interface RouterProps {
  fairwayId?: string;
}

// eslint-disable-next-line
interface MainContentProps extends RouteComponentProps<RouterProps> {
  splitPane?: boolean;
}

const MainContent: React.FC<MainContentProps> = ({ match, splitPane }) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });
  const [widePane, setWidePane] = useState(false);
  const mapElement = useRef<HTMLDivElement>(null);

  const fairwayId = match.params.fairwayId;

  const togglePane = () => {
    setWidePane(!widePane);
  };

  useIonViewWillEnter(() => {
    if (mapElement?.current) {
      dvkMap?.removeShowSidebarMenuControl();
      dvkMap?.removeSearchbarControl();
      dvkMap?.setTarget(mapElement.current);
    }
  });

  return (
    <IonPage id="mainContent">
      <IonContent>
        <IonGrid className="ion-no-padding" id="splitPane">
          <IonRow>
            {splitPane && (
              <IonCol id="fairwayContent" className={widePane ? 'wide' : ''}>
                <IonContent id="fairwayCardsContainer">
                  <IonGrid className="ion-no-padding">
                    <IonRow className="ion-align-items-center">
                      <IonCol size="auto">
                        <button className="icon" onClick={() => menuController.open()}>
                          <MenuIcon />
                        </button>
                      </IonCol>
                      <IonCol className="ion-margin-start">
                        <IonInput className="searchBar" placeholder={t('search')} />
                      </IonCol>
                      <IonCol size="auto">
                        <button className={'icon ' + (widePane ? 'flip invert' : '')} onClick={() => togglePane()}>
                          <ChevronIcon />
                        </button>
                      </IonCol>
                    </IonRow>
                  </IonGrid>

                  {fairwayId && <FairwayCard widePane={widePane} id={fairwayId} />}
                  {!fairwayId && <FairwayCards widePane={widePane} />}
                </IonContent>
              </IonCol>
            )}
            <IonCol id="mapPane">
              <IonContent className="ion-no-padding">
                <div ref={mapElement}></div>
              </IonContent>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default MainContent;
