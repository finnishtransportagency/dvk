import React from 'react';
import { IonCol, IonContent, IonFooter, IonGrid, IonItem, IonPage, IonRow, IonTitle, IonToolbar } from '@ionic/react';
import Squat from '../components/Squat';
import SquatChart from '../components/SquatChart';
import { useTranslation } from 'react-i18next';

export function getUrlParam(param: string) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

function parseBooleanUrlParam(param: string): boolean {
  const sh = getUrlParam(param);
  return sh && sh === 'false' ? false : true;
}

export const showLanguages = (): boolean => {
  return parseBooleanUrlParam('showLanguages');
};

export const showLogo = (): boolean => {
  return parseBooleanUrlParam('showLogo');
};

const Home: React.FC = () => {
  const { t } = useTranslation('', { keyPrefix: 'homePage' });

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
            <IonGrid className="ion-no-padding">
              <IonRow>
                <IonCol class="ion-align-self-center">
                  <IonItem
                    href={t('saavutettavuus-url')}
                    rel="external"
                    target="_blank"
                    detail={false}
                    lines="none"
                    className="ion-no-padding external-link"
                  >
                    {t('saavutettavuusseloste')}
                  </IonItem>
                </IonCol>
                <IonCol size="auto" class="ion-align-self-center">
                  v{`${process.env.REACT_APP_VERSION}`}
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonTitle>
        </IonToolbar>
      </IonFooter>
    </IonPage>
  );
};

export default Home;
