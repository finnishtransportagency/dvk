import {
  IonGrid,
  IonRow,
  IonCol,
  IonLabel,
  IonText,
  IonBreadcrumbs,
  IonBreadcrumb,
  IonSkeletonText,
  IonAccordionGroup,
  IonAccordion,
  IonItem,
} from '@ionic/react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MarineWarning } from '../../graphql/generated';
import arrow_down from '../../theme/img/arrow_down.svg';
import { Lang } from '../../utils/constants';
import { useWarineWarningsData } from '../../utils/dataLoader';
import dvkMap from '../DvkMap';
import { ReactComponent as InfoIcon } from '../../theme/img/info.svg';
import { AreaFairway, LineFairway } from '../features';
import Paragraph from './Paragraph';

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
          <IonGrid className="table light group" key={warning.id}>
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
                    {!warning.areaId && !warning.lineId && !warning.equipmentId && (
                      <span className="info use-flex ion-align-items-center">
                        <InfoIcon />
                        {t('noObjects')}
                      </span>
                    )}
                  </p>
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
  const { data, isLoading } = useWarineWarningsData();
  const [showDescription, setShowDescription] = useState();

  return (
    <>
      <IonBreadcrumbs>
        <IonBreadcrumb routerLink="/">
          {t('home')}
          <IonLabel slot="separator">&gt;</IonLabel>
        </IonBreadcrumb>
        <IonBreadcrumb>
          <strong>{t('title')}</strong>
        </IonBreadcrumb>
      </IonBreadcrumbs>

      <IonText>
        <h2>
          <strong>{t('title')}</strong>
        </h2>
      </IonText>
      <IonAccordionGroup onIonChange={(e) => setShowDescription(e.detail.value)}>
        <IonAccordion toggleIcon={arrow_down} color="lightest" value="1">
          <IonItem
            slot="header"
            color="lightest"
            className="accItem"
            title={showDescription ? t('closeDescription') : t('openDescription')}
            aria-label={showDescription ? t('closeDescription') : t('openDescription')}
          >
            <IonLabel>{t('general')}</IonLabel>
          </IonItem>
          <div className={'tabContent active show-print' + (widePane ? ' wide' : '')} slot="content">
            <IonText>
              <p>
                <strong>{t('description')}</strong>
              </p>
              <p>{t('additionalDescription')}</p>
              <p>
                <em>{t('notification')}</em>
              </p>
            </IonText>
          </div>
        </IonAccordion>
      </IonAccordionGroup>

      <div className={'tabContent active show-print' + (widePane ? ' wide' : '')}>
        <WarningList loading={isLoading} data={data?.marineWarnings || []} />
      </div>
    </>
  );
};

export default MarineWarnings;
