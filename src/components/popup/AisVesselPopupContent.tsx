import React from 'react';
import { useTranslation } from 'react-i18next';
import './popup.css';
import { AisFeatureProperties } from '../features';
import { PopupProperties } from '../mapOverlays/MapOverlays';
import { clearClickSelectionFeatures } from './selectInteraction';
import { IonCol, IonGrid, IonRow } from '@ionic/react';
import { coordinatesToStringHDM } from '../../utils/coordinateUtils';
import InfoIcon from '../../theme/img/info.svg?react';
import { getAisVesselShipType, getCountryCode, getNavState, reformatAisVesselDataUpdatedTime } from '../../utils/aisUtils';
import { ReactCountryFlag } from 'react-country-flag';
import CloseButton from './CloseButton';
import { Point } from 'ol/geom';
import { MAP } from '../../utils/constants';

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
  const timestamp = reformatAisVesselDataUpdatedTime(properties.timestampExternal);
  const aisPoint = properties.aisPoint as Point;
  const wgs84Point = aisPoint.clone().transform(MAP.EPSG, 'EPSG:4326');
  const coordinates = coordinatesToStringHDM(wgs84Point.getCoordinates());
  const navState = getNavState(t, properties.navStat);
  //check for unavailable properties (unavailable values: speed==102.3 and course===360)
  const speed = properties.sog > 102 ? '-' : properties.sog + 'kn';
  const course = properties.cog === 360 ? '-' : Math.round(properties.cog) + '°';
  const speedAndCourse = speed === '-' && course === '-' ? '' : `${String(speed).replace('.', ',')} / ${String(course).replace('.', ',')}`;
  //check decimals
  const vesselLength = (properties.vesselLength ?? 0) % 1 == 0 ? properties.vesselLength : properties.vesselLength?.toFixed(2).replace('.', ',');
  const vesselWidth = (properties.vesselWidth ?? 0) % 1 == 0 ? properties.vesselWidth : properties.vesselWidth?.toFixed(2).replace('.', ',');
  const lengthAndWidth = vesselLength ? `${vesselLength} x ${vesselWidth} m` : '';
  const draught = properties.draught ? `${String(properties.draught).replace('.', ',')} m` : '';
  const countryCode = getCountryCode(vessel.properties.mmsi);

  const closePopup = () => {
    if (setPopupProperties) setPopupProperties({});
    clearClickSelectionFeatures();
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
                  title={countryCode.code}
                  svg
                  style={{ height: '1.6em', width: 'auto' }}
                />
              </IonCol>
            )}
          </IonRow>
        </IonCol>
        <IonCol size="auto">
          <CloseButton close={closePopup} />
        </IonCol>
      </IonRow>
      <IonRow className="negativeMargin">
        <IonCol>{t(`popup.ais.${getAisVesselShipType(properties?.shipType)}`)}</IonCol>
      </IonRow>
      <AisVesselInfoRow title={t('popup.ais.lastUpdated')} body={timestamp} />
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
