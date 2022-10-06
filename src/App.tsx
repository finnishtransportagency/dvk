import React, { useEffect, useState } from 'react';
import { Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact, useIonAlert } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { useTranslation } from 'react-i18next';
import Home from './pages/Home';
import { ApolloClient, ApolloProvider, createHttpLink, InMemoryCache } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import SidebarMenu from './components/SidebarMenu';
import FairwayCards from './components/FairwayCards';

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

setupIonicReact();

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

const App: React.FC = () => {
  const { t } = useTranslation();
  const [showUpdateAlert] = useIonAlert();
  const [updating, setUpdating] = useState(false);
  const originalSW = navigator.serviceWorker?.controller;

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
    <IonApp>
      <IonReactRouter>
        <ApolloProvider client={client}>
          <SidebarMenu />
          <IonRouterOutlet id="MainContent">
            <Route exact path="/">
              <Home />
            </Route>
            <Route exact path="/vaylakortit">
              <FairwayCards />
            </Route>
          </IonRouterOutlet>
        </ApolloProvider>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
