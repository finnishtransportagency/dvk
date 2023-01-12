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
import { FairwayCardPartsFragment } from '../graphql/generated';
import arrow_down from '../theme/img/arrow_down.svg';
import { Link } from 'react-router-dom';
import { Lang } from '../utils/constants';
import { useFairwayCardListData } from '../utils/dataLoader';

type FairwayCardGroupProps = {
  data: FairwayCardPartsFragment[];
  title: string;
  loading?: boolean;
  first?: boolean;
};

const FairwayCardGroup: React.FC<FairwayCardGroupProps> = ({ data, title, loading, first }) => {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });
  const lang = i18n.resolvedLanguage as Lang;
  const sorted = [...data].sort((a, b) => {
    const nameA = a.name[lang] || '';
    const nameB = b.name[lang] || '';
    return nameA.localeCompare(nameB);
  });
  return (
    <div className="group">
      <IonText className={first ? 'no-margin-top' : ''}>
        <h4>
          <strong>{title}</strong>
        </h4>
      </IonText>
      <IonGrid className="table">
        <IonRow className="header">
          <IonCol>{t('name')}</IonCol>
          <IonCol>{t('modified')}</IonCol>
        </IonRow>
        {loading && <IonSkeletonText animated={true} style={{ width: '100%', height: '50px' }}></IonSkeletonText>}
        {sorted.map((fairwayCard, idx) => {
          return (
            <IonRow key={idx} className="fairwayCards">
              <IonCol>
                <IonLabel>
                  <Link to={'/vaylakortit/' + fairwayCard.id}>{fairwayCard.name[lang]}</Link>
                </IonLabel>
              </IonCol>
              <IonCol>
                <IonLabel>{t('modifiedDate', { val: fairwayCard.modificationTimestamp ? fairwayCard.modificationTimestamp : '-' })}</IonLabel>
              </IonCol>
            </IonRow>
          );
        })}
      </IonGrid>
    </div>
  );
};

type FairwayCardsProps = {
  widePane?: boolean;
};

const FairwayCards: React.FC<FairwayCardsProps> = ({ widePane }) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });
  const { data, isLoading } = useFairwayCardListData();
  const [showDescription, setShowDescription] = useState();

  return (
    <>
      <IonBreadcrumbs>
        <IonBreadcrumb routerLink="/">
          {t('home')}
          <IonLabel slot="separator">&gt;</IonLabel>
        </IonBreadcrumb>
        <IonBreadcrumb>
          <strong>{t('title', { count: 0 })}</strong>
        </IonBreadcrumb>
      </IonBreadcrumbs>

      <IonText>
        <h2>
          <strong>{t('title', { count: 0 })}</strong>
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
        <FairwayCardGroup
          title={t('archipelagoSea')}
          loading={isLoading}
          data={data?.fairwayCards.filter((card) => card.group === '1') || []}
          first
        />
        <FairwayCardGroup title={t('gulfOfFinland')} loading={isLoading} data={data?.fairwayCards.filter((card) => card.group === '2') || []} />
        <FairwayCardGroup title={t('gulfOfBothnia')} loading={isLoading} data={data?.fairwayCards.filter((card) => card.group === '3') || []} />
      </div>
    </>
  );
};

export default FairwayCards;
