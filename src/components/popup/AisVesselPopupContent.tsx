import React from 'react';
import { useTranslation } from 'react-i18next';
import './popup.css';
import { AisFeatureProperties } from '../features';
import { PopupProperties } from '../mapOverlays/MapOverlays';

type AisVesselPopupContentProps = {
  vessel: AisVesselProperties;
  setPopupProperties?: (properties: PopupProperties) => void;
};
  
export type AisVesselProperties = {
  coordinates: number[];
  properties: AisFeatureProperties;
};

const AisVesselPopupContent: React.FC<AisVesselPopupContentProps> = ({ vessel, setPopupProperties }) => {
    const { t } = useTranslation();
    
    return(
        <p>terve</p>
    )
}

export default AisVesselPopupContent;