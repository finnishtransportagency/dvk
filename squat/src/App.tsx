import React, { useEffect, useMemo, useState } from 'react';
import { IonApp, setupIonicReact, useIonAlert } from '@ionic/react';
import { SquatReducer, initialState } from './hooks/squatReducer';
import { useTranslation } from 'react-i18next';
import SquatContext from './hooks/squatContext';
import Home from './pages/Home';

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

setupIonicReact();

const App: React.FC = () => {
  const { t, i18n } = useTranslation('', { keyPrefix: 'appUpdateAlert' });
  const tRoot = i18n.getFixedT(i18n.language);
  const [state, dispatch] = React.useReducer(SquatReducer, initialState);
  const [showUpdateAlert] = useIonAlert();
  const [updating, setUpdating] = useState(false);
  const originalSW = navigator.serviceWorker?.controller;

  document.documentElement.lang = i18n.language;
  document.title = tRoot('homePage.header.title');
  document.querySelector('meta[name="description"]')?.setAttribute('content', tRoot('meta-description'));

  const providerState = useMemo(
    () => ({
      state,
      dispatch,
    }),
    []
  );

  useEffect(() => {
    if (!updating) {
      navigator.serviceWorker?.addEventListener('controllerchange', () => {
        if (!updating && originalSW) {
          showUpdateAlert({
            backdropDismiss: false,
            header: t('title'),
            message: t('content'),
            buttons: [
              {
                text: t('updateButton.label'),
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
    <SquatContext.Provider value={providerState}>
      <IonApp>
        <Home />
      </IonApp>
    </SquatContext.Provider>
  );
};

export default App;
