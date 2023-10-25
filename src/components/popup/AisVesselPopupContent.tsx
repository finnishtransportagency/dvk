import React from 'react';
//import { useTranslation } from 'react-i18next';
import './popup.css';
import { AisFeatureProperties } from '../features';
import { PopupProperties } from '../mapOverlays/MapOverlays';
import { deselectClickSelection } from './popup';
import { IonButton, IonGrid, IonIcon, IonRow } from '@ionic/react';
import closeIcon from '../../theme/img/close_black_24dp.svg';

type AisVesselPopupContentProps = {
  vessel: AisVesselProperties;
  setPopupProperties?: (properties: PopupProperties) => void;
};
export type AisVesselProperties = {
  coordinates: number[];
  properties: AisFeatureProperties;
};

const AisVesselPopupContent: React.FC<AisVesselPopupContentProps> = ({ vessel, setPopupProperties }) => {
  //const { t } = useTranslation();
  console.log(vessel);
  const closePopup = () => {
    if (setPopupProperties) setPopupProperties({});
    deselectClickSelection();
  };
  return (
    <IonGrid>
      <IonRow>
        <IonButton fill="clear" className="closeButton" onClick={() => closePopup()}>
          <IonIcon className="otherIconLarge" src={closeIcon} />
        </IonButton>
      </IonRow>
    </IonGrid>
  );
};

export default AisVesselPopupContent;
