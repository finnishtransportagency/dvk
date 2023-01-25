import React, { useEffect, useState } from 'react';
import { Route, Switch } from 'react-router-dom';
import { IonApp, IonContent, IonRouterOutlet, setupIonicReact, IonAlert, useIonAlert } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { useTranslation } from 'react-i18next';
/* React query offline cache */
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { Drivers, Storage } from '@ionic/storage';
import IonicAsyncStorage from './utils/IonicAsyncStorage';
import { OFFLINE_STORAGE } from './utils/constants';
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
  useMarineWarningLayer,
  useNameLayer,
  useBoardLine12Layer,
  useMareographLayer,
  useObservationLayer,
} from './components/FeatureLoader';
import { useFairwayCardList } from './components/FairwayDataLoader';

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
import HomePage from './pages/HomePage';
import SidebarMenu from './components/SidebarMenu';
import MapOverlays from './components/mapOverlays/MapOverlays';
import { isMobile } from './utils/common';
import FairwayCardPage from './pages/FairwayCardPage';
import FairwayCardListPage from './pages/FairwayCardListPage';
import SafetyEquipmentFaultPage from './pages/SafetyEquipmentFaultPage';
import MarineWarningPage from './pages/MarineWarningPage';
import OfflineStatus from './components/OfflineStatus';

setupIonicReact({
  mode: 'md',
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: OFFLINE_STORAGE.staleTime,
      cacheTime: OFFLINE_STORAGE.cacheTime,
    },
  },
});

const store = new Storage({
  name: OFFLINE_STORAGE.name,
  storeName: OFFLINE_STORAGE.storeName,
  driverOrder: [Drivers.IndexedDB, Drivers.LocalStorage],
});
store.create();

const asyncStoragePersister = createAsyncStoragePersister({ storage: IonicAsyncStorage(store) });

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
  const marineWarningLayer = useMarineWarningLayer();
  const fairwayCardList = useFairwayCardList();
  const nameLayer = useNameLayer();
  const boardLine12Layer = useBoardLine12Layer();
  const mareographLayer = useMareographLayer();
  const observationLayer = useObservationLayer();
  const [initDone, setInitDone] = useState(false);

  useEffect(() => {
    if (
      line12Layer.ready &&
      line3456Layer.ready &&
      area12Layer.ready &&
      area3456Layer.ready &&
      depth12Layer.ready &&
      speedLimitLayer.ready &&
      specialAreaLayer.ready &&
      pilotLayer.ready &&
      harborLayer.ready &&
      safetyEquipmentLayer.ready &&
      marineWarningLayer.ready &&
      fairwayCardList.ready &&
      nameLayer.ready &&
      boardLine12Layer.ready &&
      mareographLayer.ready &&
      observationLayer.ready
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
    marineWarningLayer,
    fairwayCardList,
    nameLayer,
    boardLine12Layer,
    mareographLayer,
    observationLayer,
  ]);

  return (
    <IonApp className={isMobile() ? 'mobile' : ''}>
      <OfflineStatus />
      <IonReactRouter>
        <SidebarMenu />
        <IonContent id="MainContent">
          <IonRouterOutlet>
            <Switch>
              <Route exact path="/">
                <HomePage />
              </Route>
              <Route exact path="/vaylakortit">
                <FairwayCardListPage />
              </Route>
              <Route exact path="/vaylakortit/:fairwayCardId">
                <FairwayCardPage />
              </Route>
              <Route exact path="/turvalaiteviat">
                <SafetyEquipmentFaultPage />
              </Route>
              <Route exact path="/merivaroitukset">
                <MarineWarningPage />
              </Route>
            </Switch>
          </IonRouterOutlet>
        </IonContent>
        <MapOverlays />
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
    <PersistQueryClientProvider client={queryClient} persistOptions={{ persister: asyncStoragePersister }}>
      <DvkIonApp />
    </PersistQueryClientProvider>
  );
};

export default App;
