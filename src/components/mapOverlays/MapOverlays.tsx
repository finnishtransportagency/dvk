import React, { useEffect, useState } from 'react';
import LayerModal from './LayerModal';
import SearchbarDropdown from './SearchbarDropdown';
import dvkMap, { BackgroundMapType } from '../DvkMap';
import PilotPopupContent, { PilotProperties } from '../popup/PilotPopupContent';
import { addPopup } from '../popup/popup';
import QuayPopupContent, { QuayProperties } from '../popup/QuayPopupContent';
import { useTranslation } from 'react-i18next';
import { filterFairways } from '../../utils/common';
import { Lang } from '../../utils/constants';
import { MobileModal, SourceModal } from './CommonModal';
import AreaPopupContent, { AreaProperties } from '../popup/AreaPopupContent';
import LinePopupContent, { LineProperties } from '../popup/LinePopupContent';
import EquipmentPopupContent, { EquipmentProperties } from '../popup/EquipmentPopupContent';
import { useFairwayCardListData } from '../../utils/dataLoader';
import MarineWarningPopupContent, { MarineWarningProperties } from '../popup/MarineWarningPopupContent';
import MareographPopupContent, { MareographProperties } from '../popup/MareographPopupContent';
import ObservationPopupContent, { ObservationProperties } from '../popup/ObservationPopupContent';
import BuoyPopupContent, { BuoyProperties } from '../popup/BuoyPopupContent';
import { MarineWarningModal } from './MarineWarningModal';
import HarborPopupContent, { HarborProperties } from '../popup/HarborPopupContent';
import VtsPointPopupContent, { VtsProperties } from '../popup/VtsPointPopupContent';
import VtsLinePopupContent from '../popup/VtsLinePopupContent';

export type PopupProperties = {
  pilot?: PilotProperties;
  quay?: QuayProperties;
  area?: AreaProperties;
  specialarea?: AreaProperties;
  line?: LineProperties;
  safetyequipment?: EquipmentProperties;
  marinewarning?: MarineWarningProperties;
  mareograph?: MareographProperties;
  observation?: ObservationProperties;
  buoy?: BuoyProperties;
  harbor?: HarborProperties;
  vtspoint?: VtsProperties;
  vtsline?: VtsProperties;
};

type MapOverlaysProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

const MapOverlays: React.FC<MapOverlaysProps> = ({ isOpen: isSourceOpen, setIsOpen: setIsSourceOpen }) => {
  const { i18n } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });
  const lang = i18n.resolvedLanguage as Lang;
  const [isOpen, setIsOpen] = useState(false);
  const [backgroundMapType, setBackgroundMapType] = useState<BackgroundMapType>(dvkMap.getBackgroundMapType());

  const [isSearchbarOpen, setIsSearchbarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSelection, setActiveSelection] = useState(0);
  const { data } = useFairwayCardListData();
  const [showMarineWarningNotification, setShowMarineWarningNotification] = useState(false);

  const filteredFairways = filterFairways(data?.fairwayCards, lang, searchQuery);

  const [popupProps, setPopupProperties] = useState<PopupProperties>();

  const dismissMapLayersModal = () => {
    const lpc = dvkMap.getLayerPopupControl();
    setIsOpen(false);
    lpc?.modalClosed();
  };
  const dismissMarineWarningNotificationModal = () => {
    setShowMarineWarningNotification(false);
  };

  const setBgMapType = (bgMapType: BackgroundMapType) => {
    setBackgroundMapType(bgMapType);
    dvkMap.setBackgroundMapType(bgMapType);
  };

  useEffect(() => {
    if (dvkMap.olMap) {
      addPopup(dvkMap.olMap, setPopupProperties);
    }
  }, []);

  const lpc = dvkMap.getLayerPopupControl();
  lpc?.onSetIsOpen(setIsOpen);

  const sc = dvkMap.getSearchbarControl();
  sc?.onSetIsOpen(setIsSearchbarOpen);
  sc?.onSetSearchQuery(setSearchQuery);
  sc?.onSetActiveSelection(setActiveSelection);
  sc?.setIsSearchbarOpen(isSearchbarOpen);
  sc?.setCurrentActiveSelection(activeSelection);
  sc?.setFilteredData(filteredFairways);

  return (
    <>
      <div id="popup" className="ol-popup">
        {popupProps?.pilot && <PilotPopupContent pilot={popupProps.pilot} setPopupProperties={setPopupProperties} />}
        {popupProps?.quay && <QuayPopupContent quay={popupProps.quay} setPopupProperties={setPopupProperties} />}
        {popupProps?.area && <AreaPopupContent area={popupProps.area} setPopupProperties={setPopupProperties} />}
        {popupProps?.specialarea && <AreaPopupContent area={popupProps.specialarea} setPopupProperties={setPopupProperties} />}
        {popupProps?.line && <LinePopupContent line={popupProps.line} setPopupProperties={setPopupProperties} />}
        {popupProps?.safetyequipment && <EquipmentPopupContent equipment={popupProps.safetyequipment} setPopupProperties={setPopupProperties} />}
        {popupProps?.marinewarning && <MarineWarningPopupContent marine={popupProps.marinewarning} setPopupProperties={setPopupProperties} />}
        {popupProps?.mareograph && <MareographPopupContent mareograph={popupProps.mareograph} setPopupProperties={setPopupProperties} />}
        {popupProps?.observation && <ObservationPopupContent observation={popupProps.observation} setPopupProperties={setPopupProperties} />}
        {popupProps?.buoy && <BuoyPopupContent buoy={popupProps.buoy} setPopupProperties={setPopupProperties} />}
        {popupProps?.harbor && <HarborPopupContent harbor={popupProps.harbor} setPopupProperties={setPopupProperties} />}
        {popupProps?.vtspoint && <VtsPointPopupContent vts={popupProps.vtspoint} setPopupProperties={setPopupProperties} />}
        {popupProps?.vtsline && <VtsLinePopupContent vts={popupProps.vtsline} setPopupProperties={setPopupProperties} />}
      </div>
      <LayerModal
        isOpen={isOpen}
        setIsOpen={dismissMapLayersModal}
        bgMapType={backgroundMapType}
        setBgMapType={setBgMapType}
        setMarineWarningLayer={setShowMarineWarningNotification}
      />
      <SearchbarDropdown isOpen={isSearchbarOpen} searchQuery={searchQuery} fairwayCards={filteredFairways} selected={activeSelection} />
      <MobileModal />
      <SourceModal isOpen={isSourceOpen} setIsOpen={setIsSourceOpen} />
      <MarineWarningModal isOpen={showMarineWarningNotification} setIsOpen={dismissMarineWarningNotificationModal} />
    </>
  );
};

export default MapOverlays;
