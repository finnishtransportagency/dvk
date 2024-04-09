import { IonGrid, IonRow, IonCol, IonText, IonSkeletonText, IonIcon } from '@ionic/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { MarineWarning } from '../../graphql/generated';
import { Lang } from '../../utils/constants';
import dvkMap from '../DvkMap';
import { AreaFairway, LineFairway } from '../features';
import Paragraph, { InfoParagraph } from './Paragraph';
import { getMarineWarningDataLayerId, getWarningImgSource, goToFeature } from '../../utils/common';
import { Link } from 'react-router-dom';
import { useDvkContext } from '../../hooks/dvkContext';
import uniqueId from 'lodash/uniqueId';
import { Feature } from 'ol';
import { Geometry } from 'ol/geom';

type WarningListProps = {
  data: MarineWarning[];
  loading?: boolean;
  sortNewFirst: boolean;
};

export const WarningList: React.FC<WarningListProps> = ({ data, loading, sortNewFirst }) => {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'warnings' });
  const { state } = useDvkContext();
  const lang = i18n.resolvedLanguage as Lang;
  const sortedWarnings = [...data].sort((a, b) => {
    if (sortNewFirst) {
      return a.dateTime > b.dateTime ? -1 : 1;
    }
    return a.dateTime > b.dateTime ? 1 : -1;
  });

  return (
    <>
      {loading && <IonSkeletonText animated={true} style={{ width: '100%', height: '50px' }}></IonSkeletonText>}
      {sortedWarnings.map((warning) => {
        return (
          <IonGrid className="table light group ion-no-padding" key={warning.id}>
            <IonRow className="header">
              <IonCol>
                <IonText>
                  <h3 className="h5">
                    {warning.type[lang]} - {warning.number}
                  </h3>
                </IonText>
              </IonCol>
              <IonCol className="ion-text-end ion-align-self-end">
                <IonText>
                  <em>{t('datetimeFormat', { val: warning.dateTime })}</em>
                </IonText>
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol size="6" className="no-padding">
                <IonRow>
                  <IonCol size="auto">
                    <IonIcon className="listIcon" src={getWarningImgSource(warning.type[lang] ?? '')} />
                  </IonCol>
                  <IonCol>
                    <IonText className="no-margin-top">
                      <h4 className="h5">{t('area')}</h4>
                      <Paragraph bodyText={warning.area} />
                    </IonText>
                  </IonCol>
                </IonRow>
              </IonCol>
              <IonCol size="6">
                <IonText className="no-margin-top">
                  <h4 className="h5">{t('location')}</h4>
                  <p>
                    <Link
                      to="/merivaroitukset/"
                      onClick={(e) => {
                        e.preventDefault();
                        goToFeature(warning.id, getMarineWarningDataLayerId(warning.type), state.layers);
                      }}
                    >
                      {warning.location[lang] ?? warning.location.fi ?? t('noObjects')}
                    </Link>
                  </p>
                </IonText>
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol>
                <IonText className="no-margin-top">
                  <h4 className="h5">{t('content')}</h4>
                  <Paragraph bodyText={warning.description} />
                </IonText>
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol size="6">
                <IonText className="no-margin-top">
                  <h4 className="h5">{t('relatedObjects')}</h4>
                  {(warning.areaId || warning.lineId || warning.equipmentId) && (
                    <p>
                      {warning.equipmentId && (
                        <>
                          {(dvkMap.getVectorSource('safetyequipment').getFeatureById(warning.equipmentId) as Feature<Geometry>)?.getProperties().name[
                            lang
                          ] ||
                            (dvkMap.getVectorSource('safetyequipment').getFeatureById(warning.equipmentId) as Feature<Geometry>)?.getProperties().name
                              .fi}
                          {' - '}
                          {warning.equipmentId}
                        </>
                      )}
                      {warning.lineId && (
                        <>
                          {(dvkMap.getVectorSource('line12').getFeatureById(warning.lineId) as Feature<Geometry>)
                            ?.getProperties()
                            .fairways?.map((fairway: LineFairway) => {
                              const uuid = uniqueId('span_');
                              return (
                                <span key={uuid}>
                                  {fairway.name[lang] ?? fairway.name.fi} - {fairway.fairwayId}
                                </span>
                              );
                            })}
                          {(dvkMap.getVectorSource('line3456').getFeatureById(warning.lineId) as Feature<Geometry>)
                            ?.getProperties()
                            .fairways?.map((fairway: LineFairway) => {
                              const uuid = uniqueId('span_');
                              return (
                                <span key={uuid}>
                                  {fairway.name[lang] ?? fairway.name.fi} - {fairway.fairwayId}
                                </span>
                              );
                            })}
                        </>
                      )}
                      {warning.areaId && (
                        <>
                          {(dvkMap.getVectorSource('area12').getFeatureById(warning.areaId) as Feature<Geometry>)
                            ?.getProperties()
                            .fairways?.map((fairway: AreaFairway) => {
                              const uuid = uniqueId('span_');
                              return (
                                <span key={uuid}>
                                  {fairway.name[lang] ?? fairway.name.fi} - {fairway.fairwayId}
                                </span>
                              );
                            })}
                          {(dvkMap.getVectorSource('area3456').getFeatureById(warning.areaId) as Feature<Geometry>)
                            ?.getProperties()
                            .fairways?.map((fairway: AreaFairway) => {
                              const uuid = uniqueId('span_');
                              return (
                                <span key={uuid}>
                                  {fairway.name[lang] ?? fairway.name.fi} - {fairway.fairwayId}
                                </span>
                              );
                            })}
                        </>
                      )}
                    </p>
                  )}
                  {!warning.areaId && !warning.lineId && !warning.equipmentId && <InfoParagraph />}
                </IonText>
              </IonCol>
              {(warning.startDateTime || warning.endDateTime) && (
                <IonCol size="6">
                  <IonText className="no-margin-top">
                    <h4 className="h5">{t('validityTime')}</h4>
                    <p>
                      {warning.startDateTime &&
                        t('datetimeFormat', {
                          val: warning.startDateTime,
                        })}
                      {' - '}
                      {warning.endDateTime &&
                        t('datetimeFormat', {
                          val: warning.endDateTime,
                        })}
                    </p>
                  </IonText>
                </IonCol>
              )}
            </IonRow>
            {warning.notifier && (
              <IonRow>
                <IonCol>
                  <IonText className="no-margin-top">
                    <h4 className="h5">{t('notifier')}</h4>
                    {warning.notifier}
                  </IonText>
                </IonCol>
              </IonRow>
            )}
          </IonGrid>
        );
      })}
    </>
  );
};
