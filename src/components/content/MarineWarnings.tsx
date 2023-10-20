import { IonGrid, IonRow, IonCol, IonText, IonSkeletonText } from '@ionic/react';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MarineWarning } from '../../graphql/generated';
import { Lang } from '../../utils/constants';
import { useMarineWarningsDataWithRelatedDataInvalidation } from '../../utils/dataLoader';
import dvkMap from '../DvkMap';
import { AreaFairway, LineFairway, MarineWarningFeatureProperties } from '../features';
import Paragraph, { InfoParagraph } from './Paragraph';
import Breadcrumb from './Breadcrumb';
import infoIcon from '../../theme/img/info.svg';
import alertIcon from '../../theme/img/alert_icon.svg';
import Alert from '../Alert';
import { getAlertProperties, getMarineWarningDataLayerId } from '../../utils/common';
import './MarineWarnings.css';
import * as olExtent from 'ol/extent';
import { Link } from 'react-router-dom';
import { useDvkContext } from '../../hooks/dvkContext';
import uniqueId from 'lodash/uniqueId';
import WarningsFilter from './WarningsFilter';

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

const WarningList: React.FC<WarningListProps> = ({ data, loading, sortNewFirst }) => {
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
              <IonCol size="6">
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

type MarineWarningsProps = {
  widePane?: boolean;
};

const MarineWarnings: React.FC<MarineWarningsProps> = ({ widePane }) => {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'warnings' });
  const lang = i18n.resolvedLanguage as Lang;
  const { data, isLoading, dataUpdatedAt, isFetching } = useMarineWarningsDataWithRelatedDataInvalidation();
  const { state } = useDvkContext();
  const [areaFilter, setAreaFilter] = useState<string[]>([]);
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [sortNewFirst, setSortNewFirst] = useState<boolean>(true);

  const path = [{ title: t('title') }];
  // Use any of the marine warning layers as they have the same data source
  const alertProps = getAlertProperties(dataUpdatedAt, 'coastalwarning');

  const getLayerItemAlertText = useCallback(() => {
    if (!alertProps || !alertProps.duration) return t('viewLastUpdatedUnknown');
    return t('lastUpdatedAt', { val: alertProps.duration });
  }, [alertProps, t]);

  useEffect(() => {
    return () => {
      // Cleanup: remove feature(s) from temporary layer
      dvkMap.getVectorSource('selectedfairwaycard').clear();
    };
  }, []);

  const filterDataByAreaAndType = useCallback(() => {
    const filteredData = data?.marineWarnings.filter((w) => {
      let foundInArea = true;
      let foundInType = true;

      if (areaFilter.length > 0) {
        foundInArea = areaFilter.some((a) => String(w.area[lang]).includes(a.toUpperCase()));
      }
      if (typeFilter.length > 0) {
        foundInType = typeFilter.some((type) => String(w.type[lang]).includes(type.toUpperCase()));
      }
      return foundInArea && foundInType;
    });

    return filteredData;
  }, [areaFilter, typeFilter, data?.marineWarnings, lang]);

  useEffect(() => {
    const source = dvkMap.getVectorSource('selectedfairwaycard');
    const features = source.getFeatures();
    // Check if corresponding layer is now visible and remove feature(s) from temp layer
    if (features.length > 0) {
      features.forEach((f) => {
        const featureProperties = f.getProperties() as MarineWarningFeatureProperties;
        const layerDataId = getMarineWarningDataLayerId(featureProperties.type);
        if (state.layers.includes(layerDataId)) {
          source.removeFeature(f);
        }
      });
    }
  }, [state.layers]);

  return (
    <>
      <Breadcrumb path={path} />

      <IonText className="fairwayTitle" id="mainPageContent">
        <h2 className="no-margin-bottom">
          <strong>{t('title')}</strong>
        </h2>
        <em>
          {t('modified')} {!isLoading && !isFetching && <>{t('datetimeFormat', { val: dataUpdatedAt })}</>}
          {(isLoading || isFetching) && (
            <IonSkeletonText
              animated={true}
              style={{ width: '85px', height: '12px', margin: '0 0 0 3px', display: 'inline-block', transform: 'skew(-15deg)' }}
            />
          )}
        </em>
      </IonText>

      <Alert
        icon={infoIcon}
        className="top-margin info"
        title={
          <>
            <strong>{t('note')}</strong> {t('notification')}
          </>
        }
      />

      {alertProps && !isLoading && !isFetching && (
        <Alert icon={alertIcon} color={alertProps.color} className={'top-margin ' + alertProps.color} title={getLayerItemAlertText()} />
      )}
      <WarningsFilter setAreaFilter={setAreaFilter} setTypeFilter={setTypeFilter} setSortNewFirst={setSortNewFirst} sortNewFirst={sortNewFirst} />

      <div id="marineWarningList" className={'tabContent active show-print' + (widePane ? ' wide' : '')} data-testid="marineWarningList">
        <WarningList loading={isLoading} data={filterDataByAreaAndType() || []} sortNewFirst={sortNewFirst} />
      </div>
    </>
  );
};

export default MarineWarnings;
