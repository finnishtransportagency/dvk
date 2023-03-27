import { IonGrid, IonRow, IonCol, IonText, IonSkeletonText } from '@ionic/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { MarineWarning } from '../../graphql/generated';
import { Lang } from '../../utils/constants';
import { useMarineWarningsDataWithRelatedDataInvalidation } from '../../utils/dataLoader';
import dvkMap from '../DvkMap';
import { AreaFairway, LineFairway } from '../features';
import Paragraph, { InfoParagraph } from './Paragraph';
import Breadcrumb from './Breadcrumb';
import infoIcon from '../../theme/img/info.svg';
import { warningOutline } from 'ionicons/icons';
import Alert from '../Alert';
import { getAlertProperties } from '../../utils/common';

type WarningListProps = {
  data: MarineWarning[];
  loading?: boolean;
};

const WarningList: React.FC<WarningListProps> = ({ data, loading }) => {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'warnings' });
  const lang = i18n.resolvedLanguage as Lang;
  const sortedWarnings = [...data].sort((a, b) => {
    return a.dateTime > b.dateTime ? -1 : 1;
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
                  <Paragraph bodyText={warning.location} />
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
                            .fairways?.map((fairway: LineFairway, index: number) => {
                              return (
                                <span key={index}>
                                  {fairway.name[lang] || fairway.name.fi} - {fairway.fairwayId}
                                </span>
                              );
                            })}
                          {dvkMap
                            .getVectorSource('line3456')
                            .getFeatureById(warning.lineId)
                            ?.getProperties()
                            .fairways?.map((fairway: LineFairway, index: number) => {
                              return (
                                <span key={index}>
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
                            .fairways?.map((fairway: AreaFairway, index: number) => {
                              return (
                                <span key={index}>
                                  {fairway.name[lang] || fairway.name.fi} - {fairway.fairwayId}
                                </span>
                              );
                            })}
                          {dvkMap
                            .getVectorSource('area3456')
                            .getFeatureById(warning.areaId)
                            ?.getProperties()
                            .fairways?.map((fairway: AreaFairway, index: number) => {
                              return (
                                <span key={index}>
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
  const { t } = useTranslation(undefined, { keyPrefix: 'warnings' });
  const { data, isLoading, dataUpdatedAt, isFetching } = useMarineWarningsDataWithRelatedDataInvalidation();
  const path = [{ title: t('title') }];
  const alertProps = getAlertProperties(dataUpdatedAt);
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
        <Alert
          icon={warningOutline}
          color={alertProps.color}
          className={'top-margin ' + alertProps.color}
          title={t('lastUpdatedAt', { val: alertProps.duration })}
        />
      )}

      <div className={'tabContent active show-print' + (widePane ? ' wide' : '')} data-testid="marineWarningList">
        <WarningList loading={isLoading} data={data?.marineWarnings || []} />
      </div>
    </>
  );
};

export default MarineWarnings;
