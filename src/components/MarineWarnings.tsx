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
import './FairwayCards.css';
import { MarineWarning } from '../graphql/generated';
import arrow_down from '../theme/img/arrow_down.svg';
import { Lang } from '../utils/constants';
import { useWarineWarningsData } from '../utils/dataLoader';

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
          <IonGrid className="table light group" key={warning.number}>
            <IonRow className="header">
              <IonCol>
                <IonLabel>
                  <strong>
                    {warning.type[lang]} - {warning.number}
                  </strong>
                </IonLabel>
              </IonCol>
              <IonCol className="ion-text-end">
                <em>{t('recordTime', { val: warning.dateTime })}</em>
              </IonCol>
            </IonRow>
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
