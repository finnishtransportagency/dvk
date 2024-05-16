import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Route, Switch } from 'react-router-dom';
import { IonApp, IonContent, IonRouterOutlet, setupIonicReact, IonAlert, useIonAlert, IonProgressBar } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { useTranslation } from 'react-i18next';
import { Query, QueryClient, QueryClientProvider, useIsFetching } from '@tanstack/react-query';
import { experimental_createPersister } from '@tanstack/react-query-persist-client';
import IdbAsyncStorage from './utils/IdbAsyncStorage';
import { getMap, InitDvkMap } from './components/DvkMap';
import { Lang, OFFLINE_STORAGE } from './utils/constants';

import {
  useLine12Layer,
  useLine3456Layer,
  useArea12Layer,
  useArea3456Layer,
  useDepth12Layer,
  useSpeedLimitLayer,
  usePilotLayer,
  useCoastalWarningLayer,
  useLocalWarningLayer,
  useBoaterWarningLayer,
  useBoardLine12Layer,
  useMareographLayer,
  useObservationLayer,
  useBuoyLayer,
  DvkLayerState,
  useVtsLineLayer,
  useVtsPointLayer,
  useCircleLayer,
  useSpecialArea2Layer,
  useSpecialArea15Layer,
  useInitStaticDataLayer,
  useVaylaWaterAreaData,
  useNameLayer,
  usePilotageAreaBorderLayer,
} from './components/FeatureLoader';
import {
  useAisVesselCargoLayer,
  useAisVesselTankerLayer,
  useAisVesselPassengerLayer,
  useAisVesselHighSpeedLayer,
  useAisVesselTugAndSpecialCraftLayer,
  useAisVesselPleasureCraftLayer,
  useAisUnspecifiedLayer,
} from './components/AisFeatureLoader';
import { usePilotageLimitLayer } from './components/PilotageLimitFeatureLoader';
import { usePilotRouteLayer } from './components/PilotRouteFeatureLoader';
import { useSafetyEquipmentAndFaultLayer } from './components/SafetyEquipmentFeatureLoader';
import { useFairwayCardList } from './components/FairwayDataLoader';
import { register as registerSwiper } from 'swiper/element/bundle';

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
import SquatCalculatorPage from './pages/SquatCalculatorPage';
import HarborPreviewPage from './pages/HarborPreviewPage';
import PilotRoutePage from './pages/PilotRoutePage';
import { useHarborLayer } from './components/HarborFeatureLoader';

setupIonicReact({
  mode: 'md',
});

/* Delete old react query ionic storage database "DVK", if still exist */
if (window.indexedDB) {
  window.indexedDB.deleteDatabase('DVK');
}

const idbAsyncStorage = IdbAsyncStorage();

/* Remove old react query cache "REACT_QUERY_OFFLINE_CACHE", if still exist */
idbAsyncStorage.removeItem('REACT_QUERY_OFFLINE_CACHE');

/* Remove old DVK_REACT_QUERY_STORAGE-* items with stringified values, if still exist */
idbAsyncStorage.removeItem('DVK_REACT_QUERY_STORAGE-["area12"]');
idbAsyncStorage.removeItem('DVK_REACT_QUERY_STORAGE-["area3456"]');
idbAsyncStorage.removeItem('DVK_REACT_QUERY_STORAGE-["boardline12"]');
idbAsyncStorage.removeItem('DVK_REACT_QUERY_STORAGE-["circle"]');
idbAsyncStorage.removeItem('DVK_REACT_QUERY_STORAGE-["depth12"]');
idbAsyncStorage.removeItem('DVK_REACT_QUERY_STORAGE-["findAllFairwayCards",{"status":["PUBLIC"]}]');
idbAsyncStorage.removeItem('DVK_REACT_QUERY_STORAGE-["findAllMarineWarnings"]');
idbAsyncStorage.removeItem('DVK_REACT_QUERY_STORAGE-["findAllSafetyEquipmentFaults"]');
idbAsyncStorage.removeItem('DVK_REACT_QUERY_STORAGE-["harbor"]');
idbAsyncStorage.removeItem('DVK_REACT_QUERY_STORAGE-["line12"]');
idbAsyncStorage.removeItem('DVK_REACT_QUERY_STORAGE-["line3456"]');
idbAsyncStorage.removeItem('DVK_REACT_QUERY_STORAGE-["marinewarning"]');
idbAsyncStorage.removeItem('DVK_REACT_QUERY_STORAGE-["pilot"]');
idbAsyncStorage.removeItem('DVK_REACT_QUERY_STORAGE-["restrictionarea"]');
idbAsyncStorage.removeItem('DVK_REACT_QUERY_STORAGE-["safetyequipment"]');
idbAsyncStorage.removeItem('DVK_REACT_QUERY_STORAGE-["safetyequipmentfault"]');
idbAsyncStorage.removeItem('DVK_REACT_QUERY_STORAGE-["specialarea2"]');
idbAsyncStorage.removeItem('DVK_REACT_QUERY_STORAGE-["specialarea15"]');
idbAsyncStorage.removeItem('DVK_REACT_QUERY_STORAGE-["vtsline"]');
idbAsyncStorage.removeItem('DVK_REACT_QUERY_STORAGE-["vtspoint"]');

/* Remove old static name and name-buster - moved to use tanstack query */
idbAsyncStorage.removeItem('name');
idbAsyncStorage.removeItem('name-buster');

const queryFilter = (query: Query) => {
  // Defaults to true. Do not persist only if meta.persist === false
  return !(query.meta && query.meta.persist === false);
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: OFFLINE_STORAGE.staleTime,
      gcTime: OFFLINE_STORAGE.cacheTime,
      persister: experimental_createPersister({
        storage: idbAsyncStorage,
        buster: import.meta.env.VITE_APP_VERSION,
        maxAge: OFFLINE_STORAGE.staleTime,
        prefix: 'DVK_STORAGE',
        filters: { predicate: queryFilter },
        serialize: (persistedQuery) => {
          return persistedQuery;
        },
        deserialize: (cached) => {
          return cached;
        },
      }),
    },
  },
});

// Register Swiper custom elements globally
registerSwiper();

const DvkIonApp: React.FC = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage as Lang;

  /* Start initializing layers that are required at ap start first */
  const fairwayCardList = useFairwayCardList();
  const line12Layer = useLine12Layer();
  const area12Layer = useArea12Layer();
  const specialArea2Layer = useSpecialArea2Layer();
  const specialArea15Layer = useSpecialArea15Layer();
  const pilotLayer = usePilotLayer();
  const harborLayer = useHarborLayer();
  const boardLine12Layer = useBoardLine12Layer();
  const bgFinlandLayer = useInitStaticDataLayer('finland', 'finland');
  const bgMmlmeriLayer = useInitStaticDataLayer('mml_meri', 'mml_meri');
  const bgMmlmerirantaviivaLayer = useInitStaticDataLayer('mml_meri_rantaviiva', 'mml_meri_rantaviiva');
  const bgMmljarviLayer = useInitStaticDataLayer('mml_jarvi', 'mml_jarvi');
  const bgMmljarvirantaviivaLayer = useInitStaticDataLayer('mml_jarvi_rantaviiva', 'mml_jarvi_rantaviiva');
  const circleLayer = useCircleLayer();
  /* Start initializing other layers */
  useDepth12Layer();
  useSpeedLimitLayer();
  useSafetyEquipmentAndFaultLayer();
  useCoastalWarningLayer();
  useLocalWarningLayer();
  useBoaterWarningLayer();
  useNameLayer();
  useMareographLayer();
  useObservationLayer();
  useBuoyLayer();
  useVtsLineLayer();
  useVtsPointLayer();
  useLine3456Layer();
  useArea3456Layer();
  useAisVesselCargoLayer();
  useAisVesselTankerLayer();
  useAisVesselPassengerLayer();
  useAisVesselHighSpeedLayer();
  useAisVesselTugAndSpecialCraftLayer();
  useAisVesselPleasureCraftLayer();
  useAisUnspecifiedLayer();
  useInitStaticDataLayer('balticsea', 'balticsea');
  useInitStaticDataLayer('mml_satamat', 'mml_satamat');
  useInitStaticDataLayer('mml_laiturit', 'mml_laiturit');
  usePilotRouteLayer();
  useVaylaWaterAreaData();
  usePilotageLimitLayer();
  usePilotageAreaBorderLayer();

  const [initDone, setInitDone] = useState(false);
  const [percentDone, setPercentDone] = useState(0);
  const [fetchError, setFetchError] = useState(false);

  const { state } = useDvkContext();

  useEffect(() => {
    const allLayers: DvkLayerState[] = [
      fairwayCardList,
      line12Layer,
      area12Layer,
      specialArea2Layer,
      specialArea15Layer,
      pilotLayer,
      harborLayer,
      boardLine12Layer,
      bgFinlandLayer,
      bgMmlmeriLayer,
      bgMmljarviLayer,
      circleLayer,
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
    pilotLayer,
    harborLayer,
    boardLine12Layer,
    bgFinlandLayer,
    bgMmlmeriLayer,
    bgMmlmerirantaviivaLayer,
    bgMmljarviLayer,
    bgMmljarvirantaviivaLayer,
    circleLayer,
    specialArea2Layer,
    specialArea15Layer,
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
      <IonReactRouter basename={state.preview ? '/esikatselu' : '/vaylakortti'}>
        <SidebarMenu setIsSourceOpen={setIsSourceOpen} />
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
              {!state.preview && (
                <Switch>
                  <Route path="/luotsausreitit">
                    <PilotRoutePage setModalContent={setModalContent} />
                  </Route>
                  <Route path="/turvalaiteviat">
                    <SafetyEquipmentFaultPage setModalContent={setModalContent} />
                  </Route>
                  <Route path="/merivaroitukset">
                    <MarineWarningPage setModalContent={setModalContent} />
                  </Route>
                  <Route path="/squat">
                    <SquatCalculatorPage setModalContent={setModalContent} />
                  </Route>
                  <Route path="/">
                    <HomePage setModalContent={setModalContent} />
                  </Route>
                </Switch>
              )}
              {state.preview && (
                <Switch>
                  <Route path="/satamat/:harborId">
                    <HarborPreviewPage setModalContent={setModalContent} />
                  </Route>
                  <Route path="/">
                    <FairwayCardPage setModalContent={setModalContent} />
                  </Route>
                </Switch>
              )}
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

  InitDvkMap(dispatch);
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
      <DvkContext.Provider value={providerState}>
        <DvkIonApp />
      </DvkContext.Provider>
    </QueryClientProvider>
  );
};

export default App;
