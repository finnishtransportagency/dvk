import { IonGrid, IonRow, IonCol, IonLabel, IonText, IonRouterLink, IonBreadcrumbs, IonBreadcrumb, IonSkeletonText } from '@ionic/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import './FairwayCards.css';
import { FairwayCardPartsFragment, useFindAllFairwayCardsQuery } from '../graphql/generated';

type FairwayCardGroupProps = {
  data: FairwayCardPartsFragment[];
  title: string;
  loading?: boolean;
};

const FairwayCardGroup: React.FC<FairwayCardGroupProps> = ({ data, title, loading }) => {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });
  const lang = i18n.resolvedLanguage as 'fi' | 'sv' | 'en';

  return (
    <>
      <IonText>
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
        {data.map((fairwayCard, idx) => {
          return (
            <IonRow key={idx} className="fairwayCards">
              <IonCol>
                <IonLabel>
                  <IonRouterLink routerLink={'/vaylakortit/' + fairwayCard.id}>{fairwayCard.name[lang]}</IonRouterLink>
                </IonLabel>
              </IonCol>
              <IonCol>
                <IonLabel>
                  {t('modifiedDate', { val: fairwayCard.modificationTimestamp ? new Date(fairwayCard.modificationTimestamp * 1000) : '-' })}
                </IonLabel>
              </IonCol>
            </IonRow>
          );
        })}
      </IonGrid>
    </>
  );
};

type FairwayCardsProps = {
  widePane?: boolean;
};

const FairwayCards: React.FC<FairwayCardsProps> = ({ widePane }) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });
  const { data, loading } = useFindAllFairwayCardsQuery();

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

      <IonGrid className="ion-no-padding">
        <IonRow>
          <IonCol size={widePane ? '6' : '12'} className={widePane ? 'wide' : ''}>
            <IonText>
              <p>
                <strong>{t('description')}</strong>
              </p>
              <p>{t('additionalDescription')}</p>
              <p>
                <em>{t('notification')}</em>
              </p>
            </IonText>
            <FairwayCardGroup title={t('archipelagoSea')} loading={loading} data={data?.fairwayCards.filter((card) => card.group === '1') || []} />
          </IonCol>
          <IonCol size={widePane ? '6' : '12'} className={widePane ? 'wide' : ''}>
            <FairwayCardGroup title={t('gulfOfFinland')} loading={loading} data={data?.fairwayCards.filter((card) => card.group === '2') || []} />
            <FairwayCardGroup title={t('gulfOfBothnia')} loading={loading} data={data?.fairwayCards.filter((card) => card.group === '3') || []} />
          </IonCol>
        </IonRow>
      </IonGrid>
    </>
  );
};

export default FairwayCards;
