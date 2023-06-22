import React, { useState } from 'react';
import LayerModal from './LayerModal';
import dvkMap, { BackgroundMapType } from '../DvkMap';

const MapOverlays: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [backgroundMapType, setBackgroundMapType] = useState<BackgroundMapType>(dvkMap.getBackgroundMapType());

  const dismissMapLayersModal = () => {
    const lpc = dvkMap.getLayerPopupControl();
    setIsOpen(false);
    lpc?.modalClosed();
  };

  const setBgMapType = (bgMapType: BackgroundMapType) => {
    setBackgroundMapType(bgMapType);
    dvkMap.setBackgroundMapType(bgMapType);
  };

  const lpc = dvkMap.getLayerPopupControl();
  lpc?.onSetIsOpen(setIsOpen);

  return <LayerModal isOpen={isOpen} setIsOpen={dismissMapLayersModal} bgMapType={backgroundMapType} setBgMapType={setBgMapType} />;
};

export default MapOverlays;
