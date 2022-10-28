import React, { useEffect, useState } from 'react';
import LayerModal from './LayerModal';
import SearchbarDropdown from './SearchbarDropdown';
import dvkMap, { BackgroundMapType } from '../DvkMap';
import PilotPopupContent, { PilotProperties } from '../popup/PilotPopupContent';
import { addPopup } from '../popup/popup';
import HarborPopupContent, { HarborProperties } from '../popup/HarborPopupContent';

export type PopupProperties = {
  pilot?: PilotProperties;
  harbor?: HarborProperties;
};

const MapOverlays: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [backgroundMapType, setBackgroundMapType] = useState<BackgroundMapType>(dvkMap.getBackgroundMapType());

  const [isSearchbarOpen, setIsSearchbarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  return (
    <>
      <div id="popup" className="ol-popup">
        <div id="popup-content">
          {popupProps?.pilot && <PilotPopupContent pilot={popupProps.pilot} />}
          {popupProps?.harbor && <HarborPopupContent harbor={popupProps.harbor} />}
        </div>
      </div>
      <LayerModal isOpen={isOpen} setIsOpen={dismissMapLayersModal} bgMapType={backgroundMapType} setBgMapType={setBgMapType} />
      <SearchbarDropdown isOpen={isSearchbarOpen} searchQuery={searchQuery} />
    </>
  );
};

export default MapOverlays;
