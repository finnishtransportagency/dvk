import React from 'react';
import { Feature } from 'ol';
import { Geometry, Point } from 'ol/geom';
import { MareographFeatureProperties } from '../../features';
import { IonIcon, IonLabel, IonRow, IonText } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { getTimeDifference, goToFeature } from '../../../utils/common';
import { coordinatesToStringHDM } from '../../../utils/coordinateUtils';
import { setSelectedMareograph } from '../../layers';
import { hourInMilliseconds } from '../../../utils/constants';
import alertIcon from '../../../theme/img/alert_icon.svg';
import InfoIcon from '../../../theme/img/info.svg?react';
import { useDvkContext } from '../../../hooks/dvkContext';

interface MareographInfoProps {
  mareographs: Feature<Geometry>[];
}

const MareographInfo: React.FC<MareographInfoProps> = ({ mareographs }) => {
  const { t } = useTranslation();

  const { state } = useDvkContext();
  const { isOffline } = state;

  const highlightMareograph = (id?: string | number) => {
    setSelectedMareograph(id);
  };

  return (
    <>
      {mareographs.length < 1 ? (
        <p>
          <strong>{t('fairwayCards.seaLevel')}:</strong> {t('common.noDataSet')}
        </p>
      ) : (
        <>
          <strong className="mareographsTitle">{t('fairwayCards.seaLevel')}:</strong>
          {mareographs?.map((mareograph) => {
            const properties = mareograph.getProperties() as MareographFeatureProperties;
            const id = mareograph.getId();
            const geometry = mareograph.getGeometry() as Point;
            const coordinates = geometry.getCoordinates();
            const isDataOutdated12Hours = getTimeDifference(properties.dateTime) > hourInMilliseconds * 12;
            const isDataOutdated1Hour = getTimeDifference(properties.dateTime) > hourInMilliseconds;

            return (
              <p key={id}>
                <IonLabel
                  className="hoverText"
                  onMouseEnter={() => highlightMareograph(id)}
                  onFocus={() => highlightMareograph(id)}
                  onMouseLeave={() => highlightMareograph(0)}
                  onBlurCapture={() => highlightMareograph(0)}
                  tabIndex={0}
                >
                  <strong>
                    {properties.name} - {t('popup.mareograph.n2000SeaLevel')}
                  </strong>
                  <br />
                  <IonRow>
                    {t('fairwayCards.mareographLocation')}:&nbsp;
                    {!!coordinates[0] && !!coordinates[1] && (
                      <u>
                        <Link
                          to={window.location.pathname}
                          onClick={(e) => {
                            e.preventDefault();
                            goToFeature(id, 'selectedfairwaycard');
                          }}
                        >
                          {coordinatesToStringHDM(coordinates)}
                        </Link>
                      </u>
                    )}
                  </IonRow>
                  <span className={isDataOutdated1Hour ? 'outdatedData no-print' : 'no-print'}>
                    <IonRow>
                      <IonText>
                        {t('popup.mareograph.dateTime')}: {t('fairwayCards.datetimeFormat', { val: properties.dateTime })}
                      </IonText>
                    </IonRow>
                  </span>
                  <span className={isDataOutdated12Hours ? 'outdatedData no-print' : 'no-print'}>
                    <IonRow>
                      <IonText>
                        {t('popup.mareograph.seaLevel')}:&nbsp;
                        {!isDataOutdated12Hours ? (
                          <>
                            {properties.waterLevel && !isOffline ? (
                              <>
                                {properties.waterLevel >= 0 ? '+' : ''}
                                {Math.round(properties.waterLevel / 10)}{' '}
                                <dd aria-label={t('fairwayCards.unit.cmDesc', { count: Math.round((properties.waterLevel || 0) / 10) })}>cm</dd>
                              </>
                            ) : (
                              <>
                                <InfoIcon className="infoIcon" />
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
                      </IonText>
                    </IonRow>
                    <IonRow>
                      <IonText>
                        {t('popup.mareograph.n2000SeaLevel')}:&nbsp;
                        {!isDataOutdated12Hours ? (
                          <>
                            {properties.n2000WaterLevel && !isOffline ? (
                              <>
                                {properties.n2000WaterLevel >= 0 ? '+' : ''}
                                {Math.round(properties.n2000WaterLevel / 10)}{' '}
                                <dd aria-label={t('fairwayCards.unit.cmDesc', { count: Math.round((properties.n2000WaterLevel || 0) / 10) })}>cm</dd>
                              </>
                            ) : (
                              <>
                                <InfoIcon className="infoIcon" />
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
                      </IonText>
                    </IonRow>
                  </span>
                </IonLabel>
              </p>
            );
          })}
        </>
      )}
    </>
  );
};

export default MareographInfo;
