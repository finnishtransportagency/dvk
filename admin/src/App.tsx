import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { IonApp, IonContent, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route, Switch } from 'react-router-dom';
import PageHeader from './components/PageHeader';
import MainPage from './pages/MainPage';
import { useTranslation } from 'react-i18next';
import { Lang } from './utils/constants';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';
/* Ionic dark mode */
//import '@ionic/react/css/palettes/dark.system.css';

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
import FairwayCardEditPage from './pages/FairwayCardEditPage';
import HarbourEditPage from './pages/HarbourEditPage';

setupIonicReact({
  mode: 'md',
});

const queryClient = new QueryClient();

const AdminIonApp: React.FC = () => {
  return (
    <IonApp>
      <IonReactRouter basename="/yllapito">
        <PageHeader />
        <IonContent>
          <IonRouterOutlet>
            <Switch>
              <Route path="/vaylakortti/:fairwayCardId">
                <FairwayCardEditPage />
              </Route>
              <Route path="/vaylakortti/">
                <FairwayCardEditPage />
              </Route>
              <Route path="/satama/:harbourId">
                <HarbourEditPage />
              </Route>
              <Route path="/satama/">
                <HarbourEditPage />
              </Route>
              <Route path="/">
                <MainPage />
              </Route>
            </Switch>
          </IonRouterOutlet>
        </IonContent>
      </IonReactRouter>
    </IonApp>
  );
};

function App() {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage as Lang;

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = t('header.mainTitle') + ' - ' + t('header.appTitle');
  }, [t, lang]);

  return (
    <QueryClientProvider client={queryClient}>
      <AdminIonApp />
    </QueryClientProvider>
  );
}

export default App;
