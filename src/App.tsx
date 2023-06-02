import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Route, Switch } from 'react-router-dom';
import { IonApp, IonContent, IonRouterOutlet, setupIonicReact, IonAlert, useIonAlert, IonProgressBar } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { useTranslation } from 'react-i18next';
/* React query offline cache */
import { QueryClient, useIsFetching } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { Drivers, Storage } from '@ionic/storage';
import IonicAsyncStorage from './utils/IonicAsyncStorage';
import { getMap, InitDvkMap } from './components/DvkMap';
import { Lang, OFFLINE_STORAGE } from './utils/constants';

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
  useBuoyLayer,
  useBackgroundFinlandLayer,
  useBackgroundMmlmeriLayer,
  useBackgroundMmljarviLayer,
  useBackgroundMmllaituritLayer,
  useBackgroundBalticseaLayer,
  DvkLayerState,
  useVtsLineLayer,
  useVtsPointLayer,
  useSoundingPointLayer,
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
import { DvkReducer, initialState } from './hooks/dvkReducer';
import DvkContext, { useDvkContext } from './hooks/dvkContext';
import { ContentModal } from './components/content/MainContentWithModal';

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
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage as Lang;

  /* Start initializing layers that are required at ap start first */
  const fairwayCardList = useFairwayCardList();
  const line12Layer = useLine12Layer();
  const area12Layer = useArea12Layer();
  const specialAreaLayer = useSpecialAreaLayer();
  const pilotLayer = usePilotLayer();
  const harborLayer = useHarborLayer();
  const boardLine12Layer = useBoardLine12Layer();
  const bgFinlandLayer = useBackgroundFinlandLayer();
  const bgMmlmeriLayer = useBackgroundMmlmeriLayer();
  const bgMmljarviLayer = useBackgroundMmljarviLayer();
  /* Start initializing other layers */
  useDepth12Layer();
  useSpeedLimitLayer();
  useSafetyEquipmentLayer();
  useMarineWarningLayer();
  useNameLayer();
  useMareographLayer();
  useObservationLayer();
  useBuoyLayer();
  useVtsLineLayer();
  useVtsPointLayer();
  useLine3456Layer();
  useArea3456Layer();
  useBackgroundBalticseaLayer();
  useBackgroundMmllaituritLayer();
  useSoundingPointLayer();
  const [initDone, setInitDone] = useState(false);
  const [percentDone, setPercentDone] = useState(0);
  const [fetchError, setFetchError] = useState(false);

  const { state } = useDvkContext();

  useEffect(() => {
    const allLayers: DvkLayerState[] = [
      fairwayCardList,
      line12Layer,
      area12Layer,
      specialAreaLayer,
      pilotLayer,
      harborLayer,
      boardLine12Layer,
      bgFinlandLayer,
      bgMmlmeriLayer,
      bgMmljarviLayer,
    ];

    let percent = 0;
    const resourcePercentage = 1 / allLayers.length;

    allLayers.forEach(function (layer) {
      if (layer.ready) percent += resourcePercentage;
    });

    setPercentDone(Math.round(percent * 100) / 100);

    setFetchError(allLayers.some((layer) => layer.isError));

    setInitDone(allLayers.every((layer) => layer.ready));
  }, [
    fairwayCardList,
    line12Layer,
    area12Layer,
    specialAreaLayer,
    pilotLayer,
    harborLayer,
    boardLine12Layer,
    bgFinlandLayer,
    bgMmlmeriLayer,
    bgMmljarviLayer,
  ]);

  const modal = useRef<HTMLIonModalElement>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState('');

  const isFetching = useIsFetching();
  const appClasses = [];
  if (isMobile()) appClasses.push('mobile');
  if (state.isOffline) appClasses.push('offline');
  if (!modalContent) appClasses.push('fullMap');
  if (lang === 'en') appClasses.push('en');

  useEffect(() => {
    setModalOpen(modalContent !== '');
  }, [modalContent]);

  const dvkMap = getMap();

  useEffect(() => {
    if (dvkMap.initialized) {
      if (state.isOffline) {
        dvkMap.setOfflineMode(true);
      } else {
        dvkMap.setOfflineMode(false);
      }
    }
  }, [dvkMap, state.isOffline]);

  const [isSourceOpen, setIsSourceOpen] = useState(false);
  return (
    <IonApp className={appClasses.join(' ')}>
      {initDone && <OfflineStatus />}
      <IonReactRouter basename="/vaylakortti">
        <SidebarMenu isSourceOpen={isSourceOpen} setIsSourceOpen={setIsSourceOpen} />
        {(!!isFetching || !initDone) && (
          <IonProgressBar
            value={percentDone}
            buffer={percentDone}
            type={!!isFetching && initDone ? 'indeterminate' : 'determinate'}
            className={fetchError ? 'danger' : ''}
          />
        )}
        <IonContent id="MainContent">
          <IonRouterOutlet>
            <Switch>
              <Route path="/kortit/:fairwayCardId">
                <FairwayCardPage setModalContent={setModalContent} />
              </Route>
              <Route path="/kortit">
                <FairwayCardListPage setModalContent={setModalContent} />
              </Route>
              <Route path="/turvalaiteviat">
                <SafetyEquipmentFaultPage setModalContent={setModalContent} />
              </Route>
              <Route path="/merivaroitukset">
                <MarineWarningPage setModalContent={setModalContent} />
              </Route>
              <Route path="/">
                <HomePage setModalContent={setModalContent} />
              </Route>
            </Switch>
          </IonRouterOutlet>
        </IonContent>
        <MapOverlays isOpen={isSourceOpen} setIsOpen={setIsSourceOpen} isOffline={state.isOffline} />
        {isMobile() && <ContentModal modal={modal} modalOpen={modalOpen} modalContent={modalContent} />}
      </IonReactRouter>
      {fetchError && (
        <IonAlert isOpen={!initDone} backdropDismiss={false} header={t('appInitAlert.errorTitle')} message={t('appInitAlert.errorContent')} />
      )}
      {!fetchError && <IonAlert isOpen={!initDone} backdropDismiss={false} header={t('appInitAlert.title')} message={t('appInitAlert.content')} />}
    </IonApp>
  );
};

const App: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [showUpdateAlert] = useIonAlert();
  const [updating, setUpdating] = useState(false);
  const originalSW = navigator.serviceWorker?.controller;

  const [state, dispatch] = React.useReducer(DvkReducer, initialState);
  const providerState = useMemo(
    () => ({
      state,
      dispatch,
    }),
    [state]
  );

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
    <PersistQueryClientProvider client={queryClient} persistOptions={{ persister: asyncStoragePersister, buster: process.env.REACT_APP_VERSION }}>
      <DvkContext.Provider value={providerState}>
        <DvkIonApp />
      </DvkContext.Provider>
    </PersistQueryClientProvider>
  );
};

export default App;
