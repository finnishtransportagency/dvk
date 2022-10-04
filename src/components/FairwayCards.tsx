import { IonContent, IonGrid, IonRow, IonCol, IonLabel, IonInput, IonBreadcrumbs, IonBreadcrumb } from '@ionic/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import './FairwayCards.css';
import { FairwayCardPartsFragment, useFindAllFairwayCardsQuery } from '../graphql/generated';

type FairwayCardGroupProps = {
  data: FairwayCardPartsFragment[];
  title: string;
};

const FairwayCardGroup: React.FC<FairwayCardGroupProps> = ({ data, title }) => {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });
  const lang = i18n.resolvedLanguage as 'fi' | 'sv' | 'en';
  return (
    <IonGrid>
      <IonRow>
        <IonCol className="header">{title}</IonCol>
      </IonRow>
      <IonRow className="header">
        <IonCol>{t('name')}</IonCol>
        <IonCol>{t('modified')}</IonCol>
      </IonRow>
      {data.map((fairwayCard, idx) => {
        return (
          <IonRow key={idx} className="fairwayCards">
            <IonCol>
              <IonLabel>{fairwayCard.name[lang]}</IonLabel>
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
  );
};

const FairwayCards: React.FC = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });
  const { data } = useFindAllFairwayCardsQuery();
  return (
    <IonContent id="fairwayCardsContainer" className="fairwayCards">
      <IonGrid>
        <IonRow>
          <IonCol>
            <button className="openSidebarMenuControl">
              <div className="openSidebarMenuControlContainer ol-unselectable ol-control"></div>
            </button>
          </IonCol>
          <IonCol>
            <IonInput className="searchBar" placeholder={t('search')} />
          </IonCol>
          <IonCol></IonCol>
        </IonRow>
        <IonRow>
          <IonCol>
            <IonBreadcrumbs>
              <IonBreadcrumb>
                {t('home')}
                <IonLabel slot="separator">&gt;</IonLabel>
              </IonBreadcrumb>
              <IonBreadcrumb>{t('title')}</IonBreadcrumb>
            </IonBreadcrumbs>
          </IonCol>
        </IonRow>
        <IonRow className="title">
          <IonCol>{t('title')}</IonCol>
        </IonRow>
        <IonRow>
          <IonCol>
            <FairwayCardGroup title={t('archipelagoSea')} data={data?.fairwayCards.filter((card) => card.group === '1') || []} />
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol>
            <FairwayCardGroup title={t('gulfOfFinland')} data={data?.fairwayCards.filter((card) => card.group === '2') || []} />
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol>
            <FairwayCardGroup title={t('gulfOfBothnia')} data={data?.fairwayCards.filter((card) => card.group === '3') || []} />
          </IonCol>
        </IonRow>
      </IonGrid>
    </IonContent>
  );
};

export default FairwayCards;
