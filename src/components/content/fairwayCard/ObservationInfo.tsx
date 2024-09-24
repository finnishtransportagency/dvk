import React from 'react';
import { useTranslation } from 'react-i18next';
import { Geometry, Point } from 'ol/geom';
import { Feature } from 'ol';
import { setSelectedObservation } from '../../layers';
import { ObservationFeatureProperties } from '../../features';
import { IonIcon, IonLabel, IonRow, IonText } from '@ionic/react';
import { Coordinate } from 'ol/coordinate';
import { Link } from 'react-router-dom';
import { getTimeDifference, goToFeature } from '../../../utils/common';
import { coordinatesToStringHDM } from '../../../utils/coordinateUtils';
import { hourInMilliseconds, MAP } from '../../../utils/constants';
import { useDvkContext } from '../../../hooks/dvkContext';
import alertIcon from '../../../theme/img/alert_icon.svg';
import InfoIcon from '../../../theme/img/info.svg?react';

interface ObservationInfoProps {
  observations: Feature<Geometry>[];
}

type ObservationInfo = {
  id: string | number | undefined;
  name: string;
  coordinates: Coordinate;
  dateTime: number;
  windSpeedAvg: number;
  windDirection: number;
  windSpeedMax: number;
  temperature: number;
  visibility: number | null;
};

function getObservationInfos(observations: Feature<Geometry>[]): Array<ObservationInfo> {
  const observationInfos = observations.map((o: Feature<Geometry>) => {
    const properties = o.getProperties() as ObservationFeatureProperties;
    return {
      id: o.getId(),
      name: properties.name,
      dateTime: properties.dateTime,
      coordinates: (o.getGeometry()?.clone().transform(MAP.EPSG, 'EPSG:4326') as Point).getCoordinates(),
      windSpeedAvg: properties.windSpeedAvg,
      windDirection: properties.windDirection,
      windSpeedMax: properties.windSpeedMax,
      temperature: properties.temperature,
      visibility: properties.visibility,
    };
  });
  return observationInfos;
}

export const ObservationInfo: React.FC<ObservationInfoProps> = ({ observations }) => {
  const { t } = useTranslation();

  const { state } = useDvkContext();
  const { isOffline } = state;

  const highlightObservation = (id: string | number) => {
    setSelectedObservation(id);
  };

  const observationInfos = getObservationInfos(observations);

  function getObservationElements(observationInfos: ObservationInfo[]) {
    return (
      <>
        {observationInfos?.map((o, idx) => {
          const isDataOutdated12Hours = getTimeDifference(o.dateTime) > hourInMilliseconds * 12;
          const isDataOutdated1Hour = getTimeDifference(o.dateTime) > hourInMilliseconds;

          return (
            <span key={o.id}>
              <IonLabel
                className="hoverText"
                onMouseEnter={() => highlightObservation(o.id ?? 0)}
                onFocus={() => highlightObservation(o.id ?? 0)}
                onMouseLeave={() => highlightObservation(0)}
                onBlur={() => highlightObservation(0)}
                tabIndex={0}
                data-testid={idx < 1 ? 'observationHover' : ''}
              >
                <IonRow>
                  <strong>
                    {o.name} - {t('popup.observation.observation')}
                  </strong>
                </IonRow>
                <IonRow>
                  {t('fairwayCards.observationLocation')}:&nbsp;
                  {!!o.coordinates[0] && !!o.coordinates[1] && (
                    <u>
                      <Link
                        to={window.location.pathname}
                        onClick={(e) => {
                          e.preventDefault();
                          goToFeature(o.id, 'selectedfairwaycard');
                        }}
                      >
                        {coordinatesToStringHDM(o.coordinates)}
                      </Link>
                    </u>
                  )}
                </IonRow>
                <span className={isDataOutdated1Hour ? 'outdatedData no-print' : 'no-print'}>
                  <IonRow>
                    <IonText>
                      {t('popup.observation.dateTime')}: {t('fairwayCards.datetimeFormat', { val: o.dateTime })}
                    </IonText>
                  </IonRow>
                </span>
                <span className={isDataOutdated12Hours ? 'outdatedData no-print' : 'no-print'}>
                  <IonRow>
                    <IonText>{t('popup.observation.windSpeedAvgDir')}:&nbsp;</IonText>
                    {!isDataOutdated12Hours ? (
                      <>
                        {o.windSpeedAvg && o.windDirection && !isOffline ? (
                          <>
                            {Math.round(o.windSpeedAvg)}&nbsp;
                            <dd aria-label={t('fairwayCards.unit.msDesc', { count: Math.round(o.windSpeedAvg || 0) })}>m/s</dd>,&nbsp;
                            {Math.round(o.windDirection)}{' '}
                            <dd aria-label={t('fairwayCards.unit.degDesc', { count: Math.round(o.windDirection || 0) })}>°</dd>
                          </>
                        ) : (
                          <>
                            <InfoIcon className="fairwayCardInfoIcon" />
                            {t('common.noData')}
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        <IonIcon className="outdatedDataIcon" icon={alertIcon} color="#EC0E0E" />
                        {t('popup.common.outdatedData')}
                      </>
                    )}
                  </IonRow>
                  <IonRow>
                    <IonText>{t('popup.observation.windSpeedMax')}:&nbsp;</IonText>
                    {!isDataOutdated12Hours ? (
                      <>
                        {o.windSpeedMax && !isOffline ? (
                          <>
                            {Math.round(o.windSpeedMax)}&nbsp;
                            <dd aria-label={t('fairwayCards.unit.msDesc', { count: Math.round(o.windSpeedMax || 0) })}>m/s</dd>
                          </>
                        ) : (
                          <>
                            <InfoIcon className="fairwayCardInfoIcon" />
                            {t('common.noData')}
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        <IonIcon className="outdatedDataIcon" icon={alertIcon} color="#EC0E0E" />
                        {t('popup.common.outdatedData')}
                      </>
                    )}
                  </IonRow>
                  <IonRow>
                    <IonText>{t('popup.observation.temperature')}:&nbsp;</IonText>
                    {!isDataOutdated12Hours ? (
                      <>
                        {o.temperature && !isOffline ? (
                          <>
                            {Math.round(o.temperature)}&nbsp;
                            <dd aria-label={t('fairwayCards.unit.degDesc', { count: Math.round(o.temperature || 0) }) + ' (Celsius)'}>°C</dd>
                          </>
                        ) : (
                          <>
                            <InfoIcon className="fairwayCardInfoIcon" />
                            {t('common.noData')}
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        <IonIcon className="outdatedDataIcon" icon={alertIcon} color="#EC0E0E" />
                        {t('popup.common.outdatedData')}
                      </>
                    )}
                  </IonRow>
                  <IonRow>
                    <IonText>{t('popup.observation.visibility')}:&nbsp;</IonText>
                    {!isDataOutdated12Hours ? (
                      <>
                        {o.visibility && !isOffline ? (
                          <>
                            {Math.round((o.visibility ?? 0) / 1000)}&nbsp;
                            <dd aria-label={t('fairwayCards.unit.kmDesc', { count: Math.round((o.visibility || 0) / 1000) })}>km</dd>
                          </>
                        ) : (
                          <>
                            <InfoIcon className="fairwayCardInfoIcon" />
                            {t('common.noData')}
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        <IonIcon className="outdatedDataIcon" icon={alertIcon} color="#EC0E0E" />
                        {t('popup.common.outdatedData')}
                      </>
                    )}
                  </IonRow>
                </span>
              </IonLabel>
              <br />
            </span>
          );
        })}
      </>
    );
  }

  return (
    <p>
      <strong className="conditionsTitle">{t('fairwayCards.windGauge')}:</strong>&nbsp;
      {observationInfos.length > 0 ? getObservationElements(observationInfos) : t('common.noDataSet')}
    </p>
  );
};
