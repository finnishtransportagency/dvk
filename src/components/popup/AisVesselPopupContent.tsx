import React from 'react';
import { useTranslation } from 'react-i18next';
import './popup.css';
import { AisFeatureProperties } from '../features';
import { PopupProperties } from '../mapOverlays/MapOverlays';
import { deselectClickSelection } from './popup';
import { IonButton, IonCol, IonGrid, IonIcon, IonRow } from '@ionic/react';
import closeIcon from '../../theme/img/close_black_24dp.svg';
import { coordinatesToStringHDM } from '../../utils/CoordinateUtils';
import InfoIcon from '../../theme/img/info.svg?react';
import {
  calculateVesselDimensions,
  checkIfMoored,
  getAisVesselShipType,
  getCountryCode,
  reformatAisVesselDataUpdatedTime,
} from '../../utils/aisUtils';
import { ReactCountryFlag } from 'react-country-flag';

type AisVesselInfoRowProperties = {
  title: string;
  body: string | undefined;
};

const AisVesselInfoRow: React.FC<AisVesselInfoRowProperties> = ({ title, body }) => {
  const { t } = useTranslation();
  return (
    <>
      <IonRow className="ion-margin-end">
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
  const dataUpdatedTime = reformatAisVesselDataUpdatedTime(properties.dataUpdatedTime);
  const coordinates = coordinatesToStringHDM(vessel.coordinates).replace('N', 'N / ');
  const navState = checkIfMoored(properties.navStat) ? t('popup.ais.moored') : t('popup.ais.moving');
  //speed and course combined
  const speed = properties.sog > 102 ? '-' : properties.sog + 'kn';
  const course = properties.cog === 360 ? '-' : properties.cog + '°';
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
  const countryCode = getCountryCode(vessel.properties.mmsi);

  const closePopup = () => {
    if (setPopupProperties) setPopupProperties({});
    deselectClickSelection();
  };

  return (
    <IonGrid className="ion-no-padding">
      <IonRow className="ion-justify-content-between">
        <IonCol>
          <IonRow>
            <IonCol size="auto" className="header ion-margin-end">
              {properties.name}
            </IonCol>
            {countryCode && (
              <IonCol className="countryFlag">
                <ReactCountryFlag
                  countryCode={countryCode.code}
                  aria-label={countryCode.name}
                  title={countryCode.name}
                  svg
                  style={{ height: '1.6em', width: 'auto' }}
                />
              </IonCol>
            )}
          </IonRow>
        </IonCol>
        <IonCol size="auto">
          <IonButton
            fill="clear"
            className="closeButton"
            onClick={() => closePopup()}
            title={t('common.close')}
            aria-label={t('common.close')}
            size="small"
          >
            <IonIcon className="otherIconLarge" src={closeIcon} slot="icon-only" />
          </IonButton>
        </IonCol>
      </IonRow>
      <IonRow className="negativeMargin">
        <IonCol>{t(`popup.ais.${getAisVesselShipType(properties?.shipType)}`)}</IonCol>
      </IonRow>
      <AisVesselInfoRow title={t('popup.ais.lastUpdated')} body={dataUpdatedTime} />
      <AisVesselInfoRow title={t('popup.ais.lastLocation')} body={coordinates} />
      <AisVesselInfoRow title={t('popup.ais.navState')} body={navState} />
      <AisVesselInfoRow title={`${t('popup.ais.speed')} / ${t('popup.ais.course').toLowerCase()}`} body={speedAndCourse} />
      <AisVesselInfoRow title="MMSI" body={String(properties.mmsi)} />
      <AisVesselInfoRow title={t('popup.ais.callSign')} body={String(properties.callSign)} />
      <AisVesselInfoRow title="IMO" body={String(properties.imo)} />
      <AisVesselInfoRow title={t('popup.ais.dimensions')} body={lengthAndWidth} />
      <AisVesselInfoRow title={t('popup.ais.draught')} body={draught} />
      <AisVesselInfoRow title={`${t('popup.ais.destination')}`} body={String(properties.destination)} />
    </IonGrid>
  );
};

export default AisVesselPopupContent;
