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
import { MobileModal } from './MobileModal';
import AreaPopupContent, { AreaProperties } from '../popup/AreaPopupContent';
import LinePopupContent, { LineProperties } from '../popup/LinePopupContent';
import EquipmentPopupContent, { EquipmentProperties } from '../popup/EquipmentPopupContent';
import { useFairwayCardListData } from '../../utils/dataLoader';
import MarineWarningPopupContent, { MarineWarningProperties } from '../popup/MarineWarningPopupContent';
import MareographPopupContent, { MareographProperties } from '../popup/MareographPopupContent';
import ObservationPopupContent, { ObservationProperties } from '../popup/ObservationPopupContent';

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
};

const MapOverlays: React.FC = () => {
  const { i18n } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });
  const lang = i18n.resolvedLanguage as Lang;
  const [isOpen, setIsOpen] = useState(false);
  const [backgroundMapType, setBackgroundMapType] = useState<BackgroundMapType>(dvkMap.getBackgroundMapType());

  const [isSearchbarOpen, setIsSearchbarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSelection, setActiveSelection] = useState(0);
  const { data } = useFairwayCardListData();

  const filteredFairways = filterFairways(data?.fairwayCards, lang, searchQuery);

  const [popupProps, setPopupProperties] = useState<PopupProperties>();

  const dismissMapLayersModal = () => {
    const lpc = dvkMap.getLayerPopupControl();
    setIsOpen(false);
    lpc?.modalClosed();
  };

  const setBgMapType = (bgMapType: BackgroundMapType) => {
    setBackgroundMapType(bgMapType);
    dvkMap.setBackGroundMapType(bgMapType);
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
        <div id="popup-content">
          {popupProps?.pilot && <PilotPopupContent pilot={popupProps.pilot} />}
          {popupProps?.quay && <QuayPopupContent quay={popupProps.quay} />}
          {popupProps?.area && <AreaPopupContent area={popupProps.area} />}
          {popupProps?.specialarea && <AreaPopupContent area={popupProps.specialarea} />}
          {popupProps?.line && <LinePopupContent line={popupProps.line} />}
          {popupProps?.safetyequipment && <EquipmentPopupContent equipment={popupProps.safetyequipment} />}
          {popupProps?.marinewarning && <MarineWarningPopupContent marine={popupProps.marinewarning} />}
          {popupProps?.mareograph && <MareographPopupContent mareograph={popupProps.mareograph} />}
          {popupProps?.observation && <ObservationPopupContent observation={popupProps.observation} />}
        </div>
      </div>
      <LayerModal isOpen={isOpen} setIsOpen={dismissMapLayersModal} bgMapType={backgroundMapType} setBgMapType={setBgMapType} />
      <SearchbarDropdown isOpen={isSearchbarOpen} searchQuery={searchQuery} fairwayCards={filteredFairways} selected={activeSelection} />
      <MobileModal />
    </>
  );
};

export default MapOverlays;
