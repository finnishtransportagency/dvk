import React, { useCallback, useEffect, useState } from 'react';
import LayerModal from './LayerModal';
import SearchbarDropdown from './SearchbarDropdown';
import dvkMap, { BackgroundMapType } from '../DvkMap';
import PilotPopupContent, { PilotProperties } from '../popup/PilotPopupContent';
import { addPopup } from '../popup/popup';
import QuayPopupContent, { QuayProperties } from '../popup/QuayPopupContent';
import { useTranslation } from 'react-i18next';
import { filterFairways, updateIceLayerOpacity } from '../../utils/common';
import { Lang } from '../../utils/constants';
import { CommonModal, SourceModal, FeedbackModal } from './CommonModal';
import AreaPopupContent, { AreaProperties } from '../popup/AreaPopupContent';
import LinePopupContent, { LineProperties } from '../popup/LinePopupContent';
import EquipmentPopupContent, { EquipmentProperties } from '../popup/EquipmentPopupContent';
import { useFairwayCardListData, useSaveFeedback } from '../../utils/dataLoader';
import MarineWarningPopupContent, { MarineWarningProperties } from '../popup/MarineWarningPopupContent';
import MareographPopupContent, { MareographProperties } from '../popup/MareographPopupContent';
import ObservationPopupContent, { ObservationProperties } from '../popup/ObservationPopupContent';
import ForecastPopupContent, { ForecastProperties } from '../popup/ForecastPopupContent';
import BuoyPopupContent, { BuoyProperties } from '../popup/BuoyPopupContent';
import HarborPopupContent, { HarborProperties } from '../popup/HarborPopupContent';
import VtsPointPopupContent, { VtsProperties } from '../popup/VtsPointPopupContent';
import VtsLinePopupContent from '../popup/VtsLinePopupContent';

import { MarineWarningNotifications } from './MarineWarningNotifications';
import { LoadErrorNotifications } from './LoaderErrorNotifications';
import { initUserLocation, placeUserLocationMarker, removeUserLocationMarker } from './userLocationMarker';
import { useDvkContext } from '../../hooks/dvkContext';
import AisVesselPopupContent, { AisVesselProperties } from '../popup/AisVesselPopupContent';
import FeatureListPopupContent, { FeatureListProperties } from '../popup/FeatureListPopupContent';
import PilotRoutePopupContent, { PilotRouteProperties } from '../popup/PilotRoutePopupContent';
import PilotageLimitPopupContent, { PilotageLimitProperties } from '../popup/PilotageLimitPopupContent';
import DirwayPopupContent, { DirwayProperties } from '../popup/DirwayPopupContent';
import RestrictionPortPopupContent, { RestrictionPortProperties } from '../popup/RestrictionPortPopupContent';
import ProhibitionAreaPopupContent, { ProhibitionAreaProperties } from '../popup/ProhibitionAreaPopupContent';
import { IonCol, IonGrid, IonRow, IonText, IonToast } from '@ionic/react';
import { FeedbackInput } from '../../graphql/generated';

export type PopupProperties = {
  pilot?: PilotProperties;
  pilotagelimit?: PilotageLimitProperties;
  pilotroute?: PilotRouteProperties;
  quay?: QuayProperties;
  section?: QuayProperties;
  area?: AreaProperties;
  specialarea2?: AreaProperties;
  specialarea15?: ProhibitionAreaProperties;
  line?: LineProperties;
  safetyequipment?: EquipmentProperties;
  safetyequipmentfault?: EquipmentProperties;
  marinewarning?: MarineWarningProperties;
  mareograph?: MareographProperties;
  observation?: ObservationProperties;
  forecast?: ForecastProperties;
  buoy?: BuoyProperties;
  harbor?: HarborProperties;
  vtspoint?: VtsProperties;
  vtsline?: VtsProperties;
  aisvessel?: AisVesselProperties;
  dirway?: DirwayProperties;
  restrictionport?: RestrictionPortProperties;
  featureList?: FeatureListProperties;
};

type MapOverlaysProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isFeedbackOpen: boolean;
  setIsFeedbackOpen: (open: boolean) => void;
};

const MapOverlays: React.FC<MapOverlaysProps> = ({ isOpen: isSourceOpen, setIsOpen: setIsSourceOpen, isFeedbackOpen, setIsFeedbackOpen }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage as Lang;
  const { state, dispatch } = useDvkContext();
  const [isOpen, setIsOpen] = useState(window.location.hash === '#layerModal');
  const [backgroundMapType, setBackgroundMapType] = useState<BackgroundMapType>(dvkMap.getBackgroundMapType());

  const [isSearchbarOpen, setIsSearchbarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSelection, setActiveSelection] = useState(0);
  const { data } = useFairwayCardListData();
  const [showMarineWarningNotification, setShowMarineWarningNotification] = useState(false);
  const filteredFairways = filterFairways(data?.fairwayCards, lang, searchQuery);
  const [popupProperties, setPopupProperties] = useState<PopupProperties>();
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [isToastOpen, setIsToastOpen] = useState(false);

  const openMapLayersModal = () => {
    setIsOpen(true);
    window.location.hash = '#layerModal';
  };

  const dismissMapLayersModal = () => {
    const lpc = dvkMap.getLayerPopupControl();
    setIsOpen(false);
    window.location.hash = '';
    lpc?.modalClosed();
  };

  const setBgMapType = (bgMapType: BackgroundMapType) => {
    setBackgroundMapType(bgMapType);
    dvkMap.setBackgroundMapType(bgMapType);
  };

  useEffect(() => {
    if (dvkMap.olMap) {
      addPopup(dvkMap.olMap, setPopupProperties);

      dvkMap.olMap.getView().on('change:resolution', () => {
        if (dvkMap.getFeatureLayer('ice').isVisible()) {
          updateIceLayerOpacity();
        }
      });
    }
  }, []);

  useEffect(() => {
    initUserLocation(dispatch);
  }, [dispatch]);

  useEffect(() => {
    if (state.locationPermission === 'on') {
      placeUserLocationMarker();
    } else {
      removeUserLocationMarker();
    }
  }, [state.locationPermission]);

  window.addEventListener(
    'hashchange',
    () => {
      if (window.location.hash === '#layerModal') {
        setIsOpen(true);
      } else {
        dismissMapLayersModal();
      }
    },
    false
  );

  const lpc = dvkMap.getLayerPopupControl();
  lpc?.onSetIsOpen(openMapLayersModal);

  const sc = dvkMap.getSearchbarControl();
  sc?.onSetIsOpen(setIsSearchbarOpen);
  sc?.onSetSearchQuery(setSearchQuery);
  sc?.onSetActiveSelection(setActiveSelection);
  sc?.setIsSearchbarOpen(isSearchbarOpen);
  sc?.setCurrentActiveSelection(activeSelection);
  sc?.setFilteredData(filteredFairways);

  const { mutate: saveFeedbackMutation } = useSaveFeedback();
  const saveFeedback = useCallback(
    (feedback: FeedbackInput) => {
      saveFeedbackMutation({ feedback });
    },
    [saveFeedbackMutation]
  );

  return (
    <>
      <div id="popup" className="ol-popup">
        {popupProperties?.pilot && <PilotPopupContent pilot={popupProperties.pilot} setPopupProperties={setPopupProperties} />}
        {popupProperties?.pilotagelimit && (
          <PilotageLimitPopupContent pilotagelimit={popupProperties.pilotagelimit} setPopupProperties={setPopupProperties} />
        )}
        {popupProperties?.pilotroute && <PilotRoutePopupContent pilotroute={popupProperties.pilotroute} setPopupProperties={setPopupProperties} />}
        {popupProperties?.quay && <QuayPopupContent quay={popupProperties.quay} setPopupProperties={setPopupProperties} />}
        {popupProperties?.section && <QuayPopupContent quay={popupProperties.section} setPopupProperties={setPopupProperties} />}
        {popupProperties?.area && <AreaPopupContent area={popupProperties.area} setPopupProperties={setPopupProperties} />}
        {popupProperties?.specialarea2 && <AreaPopupContent area={popupProperties.specialarea2} setPopupProperties={setPopupProperties} />}
        {popupProperties?.specialarea15 && (
          <ProhibitionAreaPopupContent area={popupProperties.specialarea15} setPopupProperties={setPopupProperties} />
        )}
        {popupProperties?.line && <LinePopupContent line={popupProperties.line} setPopupProperties={setPopupProperties} />}
        {popupProperties?.safetyequipment && (
          <EquipmentPopupContent equipment={popupProperties.safetyequipment} setPopupProperties={setPopupProperties} />
        )}
        {popupProperties?.safetyequipmentfault && (
          <EquipmentPopupContent equipment={popupProperties.safetyequipmentfault} setPopupProperties={setPopupProperties} />
        )}
        {popupProperties?.marinewarning && (
          <MarineWarningPopupContent marine={popupProperties.marinewarning} setPopupProperties={setPopupProperties} />
        )}
        {popupProperties?.mareograph && <MareographPopupContent mareograph={popupProperties.mareograph} setPopupProperties={setPopupProperties} />}
        {popupProperties?.observation && (
          <ObservationPopupContent observation={popupProperties.observation} setPopupProperties={setPopupProperties} />
        )}
        {popupProperties?.forecast && <ForecastPopupContent forecast={popupProperties.forecast} setPopupProperties={setPopupProperties} />}
        {popupProperties?.buoy && <BuoyPopupContent buoy={popupProperties.buoy} setPopupProperties={setPopupProperties} />}
        {popupProperties?.harbor && <HarborPopupContent harbor={popupProperties.harbor} setPopupProperties={setPopupProperties} />}
        {popupProperties?.vtspoint && <VtsPointPopupContent vts={popupProperties.vtspoint} setPopupProperties={setPopupProperties} />}
        {popupProperties?.vtsline && <VtsLinePopupContent vts={popupProperties.vtsline} setPopupProperties={setPopupProperties} />}
        {popupProperties?.aisvessel && <AisVesselPopupContent vessel={popupProperties.aisvessel} setPopupProperties={setPopupProperties} />}
        {popupProperties?.dirway && <DirwayPopupContent dirway={popupProperties.dirway} setPopupProperties={setPopupProperties} />}
        {popupProperties?.restrictionport && (
          <RestrictionPortPopupContent restrictionPort={popupProperties.restrictionport} setPopupProperties={setPopupProperties} />
        )}
        {popupProperties?.featureList && (
          <FeatureListPopupContent featureList={popupProperties.featureList} setPopupProperties={setPopupProperties} />
        )}
      </div>
      <LayerModal
        isOpen={isOpen}
        setIsOpen={dismissMapLayersModal}
        bgMapType={backgroundMapType}
        setBgMapType={setBgMapType}
        setMarineWarningNotificationLayer={setShowMarineWarningNotification}
        infoModalOpen={infoModalOpen}
        setInfoModalOpen={setInfoModalOpen}
      />
      <CommonModal
        isOpen={infoModalOpen}
        setIsOpen={setInfoModalOpen}
        title={t('homePage.map.controls.layer.saveSelection')}
        showBackdrop
        size="large"
        htmlId="layerInfoModal"
      >
        <IonGrid>
          <IonRow>
            <IonCol>
              <IonText>{t('homePage.map.controls.layer.modal.description')}</IonText>
            </IonCol>
          </IonRow>
        </IonGrid>
      </CommonModal>
      <SearchbarDropdown isOpen={isSearchbarOpen} searchQuery={searchQuery} fairwayCards={filteredFairways} selected={activeSelection} />
      <SourceModal isOpen={isSourceOpen} setIsOpen={setIsSourceOpen} />
      <FeedbackModal
        isOpen={isFeedbackOpen}
        setIsOpen={setIsFeedbackOpen}
        handleSubmit={(rating: number, feedback: string) => {
          console.log('Arvosana:', rating);
          console.log('Palaute:', feedback);
          console.log('Palaute lähetetty!');
          saveFeedback({ rating, feedback });
          setIsToastOpen(true);
        }}
      />
      <IonToast
        isOpen={isToastOpen}
        message="Palaute lähetetty, kiitos!"
        onDidDismiss={() => setIsToastOpen(false)}
        duration={3000}
        position="top"
      ></IonToast>
      <div className="no-print">
        <MarineWarningNotifications showMarineWarnings={showMarineWarningNotification} />
        <LoadErrorNotifications />
      </div>
    </>
  );
};

export default MapOverlays;
