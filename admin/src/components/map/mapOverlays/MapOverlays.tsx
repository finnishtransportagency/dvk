import React, { useState } from 'react';
import LayerModal from './LayerModal';
import dvkMap from '../DvkMap';

const MapOverlays: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dismissMapLayersModal = () => {
    const lpc = dvkMap.getLayerPopupControl();
    setIsOpen(false);
    lpc?.modalClosed();
  };

  const lpc = dvkMap.getLayerPopupControl();
  lpc?.onSetIsOpen(setIsOpen);

  return <LayerModal isOpen={isOpen} setIsOpen={dismissMapLayersModal} />;
};

export default MapOverlays;
