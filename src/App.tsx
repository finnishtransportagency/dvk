import React, { useEffect, useState } from 'react';
import { Route } from 'react-router-dom';
import { IonApp, IonContent, IonRouterOutlet, setupIonicReact, IonAlert, useIonAlert } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { useTranslation } from 'react-i18next';
import { ApolloClient, ApolloProvider, createHttpLink, InMemoryCache } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import MainContent from './components/MainContent';
import { InitDvkMap } from './components/DvkMap';
import {
  useLine12Layer,
  useLine3456Layer,
  useArea12Layer,
  useArea3456Layer,
  useDepth12Layer,
  useSpeedLimitLayer,
  useSpecialAreaLayer,
  usePilotLayer,
  useHarborLayer,
  useSafetyEquipmentLayer,
} from './components/FeatureLoader';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import './theme/dvk.css';
import './theme/print.css';
import Home from './pages/Home';
import SidebarMenu from './components/SidebarMenu';
import MapOverlays from './components/mapOverlays/MapOverlays';
import { isMobile } from './utils/common';

setupIonicReact({
  mode: 'md',
});

const queryClient = new QueryClient();

const httpLink = createHttpLink({ uri: process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL : '/graphql' });
const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
      'x-api-key': process.env.REACT_APP_API_KEY || 'key missing',
    },
  };
});
const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

const DvkIonApp: React.FC = () => {
  const { t } = useTranslation();
  const line12Layer = useLine12Layer();
  const line3456Layer = useLine3456Layer();
  const area12Layer = useArea12Layer();
  const area3456Layer = useArea3456Layer();
  const depth12Layer = useDepth12Layer();
  const speedLimitLayer = useSpeedLimitLayer();
  const specialAreaLayer = useSpecialAreaLayer();
  const pilotLayer = usePilotLayer();
  const harborLayer = useHarborLayer();
  const safetyEquipmentLayer = useSafetyEquipmentLayer();

  const [initDone, setInitDone] = useState(false);

  useEffect(() => {
    if (
      line12Layer &&
      line3456Layer &&
      area12Layer &&
      area3456Layer &&
      depth12Layer &&
      speedLimitLayer &&
      specialAreaLayer &&
      pilotLayer &&
      harborLayer &&
      safetyEquipmentLayer
    ) {
      setInitDone(true);
    }
  }, [
    line12Layer,
    line3456Layer,
    area12Layer,
    area3456Layer,
    depth12Layer,
    speedLimitLayer,
    specialAreaLayer,
    pilotLayer,
    harborLayer,
    safetyEquipmentLayer,
  ]);

  return (
    <IonApp className={isMobile() ? 'mobile' : ''}>
      <IonReactRouter>
        <ApolloProvider client={client}>
          <SidebarMenu />
          <IonContent id="MainContent">
            <IonRouterOutlet>
              <Route exact path="/" render={(props) => <Home {...props} />} />
              <Route path="/vaylakortit/:fairwayId" render={(props) => <MainContent splitPane {...props} />} />
              <Route exact path="/vaylakortit" render={(props) => <MainContent splitPane {...props} />} />
            </IonRouterOutlet>
          </IonContent>
          <MapOverlays />
        </ApolloProvider>
      </IonReactRouter>
      <IonAlert isOpen={!initDone} backdropDismiss={false} header={t('appInitAlert.title')} message={t('appInitAlert.content')} />
    </IonApp>
  );
};

const App: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [showUpdateAlert] = useIonAlert();
  const [updating, setUpdating] = useState(false);
  const originalSW = navigator.serviceWorker?.controller;

  document.documentElement.lang = i18n.language;

  InitDvkMap();

  useEffect(() => {
    if (!updating) {
      navigator.serviceWorker?.addEventListener('controllerchange', () => {
        if (!updating && originalSW) {
          showUpdateAlert({
            backdropDismiss: false,
            header: t('appUpdateAlert.title'),
            message: t('appUpdateAlert.content'),
            buttons: [
              {
                text: t('appUpdateAlert.updateButton.label'),
                handler: () => {
                  window.location.reload();
                  return true;
                },
              },
            ],
          });
          setUpdating(true);
        }
      });
    }
  }, [showUpdateAlert, updating, t, originalSW]);

  return (
    <QueryClientProvider client={queryClient}>
      <DvkIonApp />
    </QueryClientProvider>
  );
};

export default App;
