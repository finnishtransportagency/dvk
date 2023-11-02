import React from 'react';
import { useTranslation } from 'react-i18next';
import './popup.css';
import { AisFeatureProperties } from '../features';
import { PopupProperties } from '../mapOverlays/MapOverlays';
import { deselectClickSelection } from './popup';
import { IonButton, IonCol, IonGrid, IonIcon, IonRow } from '@ionic/react';
import closeIcon from '../../theme/img/close_black_24dp.svg';
import { coordinatesToStringHDM } from '../../utils/CoordinateUtils';
import { checkIfMoored, getAisVesselShipType, reformatAisvesselDataUpdatedTime, calculateVesselDimensions } from '../../utils/common';
import InfoIcon from '../../theme/img/info.svg?react';

type AisVesselInfoRowProperties = {
  title: string;
  body: string | undefined;
};

const AisVesselInfoRow: React.FC<AisVesselInfoRowProperties> = ({ title, body }) => {
  const { t } = useTranslation();
  return (
    <>
      <IonRow>
        <IonCol className="header">{title}</IonCol>
      </IonRow>
      <IonRow>
        {body ? (
          <IonCol>{body}</IonCol>
        ) : (
          <IonCol className="info">
            <InfoIcon />
            {t('common.noDataSet')}
          </IonCol>
        )}
      </IonRow>
    </>
  );
};

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

  const properties = vessel.properties;
  const dataUpdatedTime = reformatAisvesselDataUpdatedTime(properties.dataUpdatedTime);
  const coordinates = coordinatesToStringHDM(vessel.coordinates).replace('N', 'N / ');
  const navState = checkIfMoored(properties.navStat) ? t('popup.ais.moored') : t('popup.ais.moving');
  //check for unavailable properties (unavailable values: speed==102.3 and course===360)
  const speed = properties.sog > 102 ? '-' : properties.sog + 'kn';
  const course = properties.cog === 360 ? '-' : Math.round(properties.cog) + '°';
  const speedAndCourse = speed === '-' && course === '-' ? '' : `${String(speed).replace('.', ',')} / ${String(course).replace('.', ',')}`;
  const vesselDimensions = calculateVesselDimensions(
    properties.referencePointA,
    properties.referencePointB,
    properties.referencePointC,
    properties.referencePointD
  );
  //check decimals
  const vesselLength = vesselDimensions[0] % 1 == 0 ? vesselDimensions[0] : vesselDimensions[0].toFixed(2).replace('.', ',');
  const vesselWidth = vesselDimensions[1] % 1 == 0 ? vesselDimensions[1] : vesselDimensions[1].toFixed(2).replace('.', ',');
  const lengthAndWidth = vesselLength ? `${vesselLength} x ${vesselWidth} m` : '';
  const draught = properties.draught ? `${String(properties.draught).replace('.', ',')} m` : '';

  const closePopup = () => {
    if (setPopupProperties) setPopupProperties({});
    deselectClickSelection();
  };

  return (
    <IonGrid id="aisVesselPopupContent">
      <IonGrid className="ion-no-padding">
        <IonRow className="ion-justify-content-between">
          <IonCol size="auto" className="header">
            {properties.name}
          </IonCol>
          <IonCol size="auto">
            <IonButton fill="clear" className="closeButton" onClick={() => closePopup()} title={t('common.close')} aria-label={t('common.close')}>
              <IonIcon className="otherIconLarge" src={closeIcon} />
            </IonButton>
          </IonCol>
        </IonRow>
        <IonRow id="higher"> {t(`popup.ais.${getAisVesselShipType(properties?.shipType)}`)}</IonRow>
        <AisVesselInfoRow title={t('popup.ais.lastUpdated')} body={dataUpdatedTime} />
        <AisVesselInfoRow title={t('popup.ais.lastLocation')} body={coordinates} />
        <AisVesselInfoRow title={t('popup.ais.navState')} body={navState} />
        <AisVesselInfoRow title={`${t('popup.ais.speed')} / ${t('popup.ais.course').toLowerCase()}`} body={speedAndCourse} />
        <AisVesselInfoRow title="MMSI" body={properties.mmsi} />
        <AisVesselInfoRow title={t('popup.ais.callSign')} body={String(properties.callSign)} />
        <AisVesselInfoRow title="IMO" body={String(properties.imo)} />
        <AisVesselInfoRow title={t('popup.ais.dimensions')} body={lengthAndWidth} />
        <AisVesselInfoRow title={t('popup.ais.draught')} body={draught} />
        <AisVesselInfoRow title={`${t('popup.ais.destination')}`} body={String(properties.destination)} />
      </IonGrid>
    </IonGrid>
  );
};

export default AisVesselPopupContent;
