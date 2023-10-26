import { IonGrid, IonRow, IonCol, IonText, IonSkeletonText, IonIcon } from '@ionic/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { MarineWarning } from '../../graphql/generated';
import { Lang } from '../../utils/constants';
import dvkMap from '../DvkMap';
import { AreaFairway, LineFairway } from '../features';
import Paragraph, { InfoParagraph } from './Paragraph';
import { getMarineWarningDataLayerId, getWarningImgSource } from '../../utils/common';
import * as olExtent from 'ol/extent';
import { Link } from 'react-router-dom';
import { useDvkContext } from '../../hooks/dvkContext';
import uniqueId from 'lodash/uniqueId';

type WarningListProps = {
  data: MarineWarning[];
  loading?: boolean;
  sortNewFirst: boolean;
};

function goto(warning: MarineWarning, layers: string[]) {
  // Clear possible previous feature(s) from temporary layer
  const selectedFairwayCardSource = dvkMap.getVectorSource('selectedfairwaycard');
  selectedFairwayCardSource.clear();

  const layerDataId = getMarineWarningDataLayerId(warning.type);
  const warningSource = dvkMap.getVectorSource(layerDataId);
  const feature = warningSource.getFeatureById(warning.id);

  if (feature) {
    // If warning layer is not visible, use selectedfairwaycard to show warning on map
    if (!layers.includes(layerDataId)) {
      selectedFairwayCardSource.addFeature(feature);
    }
    const geometry = feature.getGeometry();
    if (geometry) {
      const extent = olExtent.createEmpty();
      olExtent.extend(extent, geometry.getExtent());
      dvkMap.olMap?.getView().fit(extent, { minResolution: 10, padding: [50, 50, 50, 50], duration: 1000 });
    }
  }
}
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
    <div>
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
              <IonCol size="6" style={{ display: 'flex' }}>
                <IonIcon className="listIcon" src={getWarningImgSource(warning.type[lang] ?? '')} />
                <IonText className="no-margin-top">
                  <h4 className="h5">{t('area')}</h4>
                  <Paragraph bodyText={warning.area} />
                </IonText>
              </IonCol>
              <IonCol size="6">
                <IonText className="no-margin-top">
                  <h4 className="h5">{t('location')}</h4>
                  <p>
                    <Link
                      to="/merivaroitukset/"
                      onClick={(e) => {
                        e.preventDefault();
                        goto(warning, state.layers);
                      }}
                    >
                      {warning.location[lang] || warning.location.fi || t('noObjects')}
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
                          {dvkMap.getVectorSource('safetyequipment').getFeatureById(warning.equipmentId)?.getProperties().name[lang] ||
                            dvkMap.getVectorSource('safetyequipment').getFeatureById(warning.equipmentId)?.getProperties().name.fi}
                          {' - '}
                          {warning.equipmentId}
                        </>
                      )}
                      {warning.lineId && (
                        <>
                          {dvkMap
                            .getVectorSource('line12')
                            .getFeatureById(warning.lineId)
                            ?.getProperties()
                            .fairways?.map((fairway: LineFairway) => {
                              const uuid = uniqueId('span_');
                              return (
                                <span key={uuid}>
                                  {fairway.name[lang] || fairway.name.fi} - {fairway.fairwayId}
                                </span>
                              );
                            })}
                          {dvkMap
                            .getVectorSource('line3456')
                            .getFeatureById(warning.lineId)
                            ?.getProperties()
                            .fairways?.map((fairway: LineFairway) => {
                              const uuid = uniqueId('span_');
                              return (
                                <span key={uuid}>
                                  {fairway.name[lang] || fairway.name.fi} - {fairway.fairwayId}
                                </span>
                              );
                            })}
                        </>
                      )}
                      {warning.areaId && (
                        <>
                          {dvkMap
                            .getVectorSource('area12')
                            .getFeatureById(warning.areaId)
                            ?.getProperties()
                            .fairways?.map((fairway: AreaFairway) => {
                              const uuid = uniqueId('span_');
                              return (
                                <span key={uuid}>
                                  {fairway.name[lang] || fairway.name.fi} - {fairway.fairwayId}
                                </span>
                              );
                            })}
                          {dvkMap
                            .getVectorSource('area3456')
                            .getFeatureById(warning.areaId)
                            ?.getProperties()
                            .fairways?.map((fairway: AreaFairway) => {
                              const uuid = uniqueId('span_');
                              return (
                                <span key={uuid}>
                                  {fairway.name[lang] || fairway.name.fi} - {fairway.fairwayId}
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
    </div>
  );
};
