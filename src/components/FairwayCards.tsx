import { IonContent, IonGrid, IonRow, IonCol, IonLabel, IonInput, IonBreadcrumbs, IonBreadcrumb } from '@ionic/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import './FairwayCards.css';
import { useFindAllFairwayCardsQuery } from '../graphql/generated';

type Text = {
  fi?: string;
  sv?: string;
  en?: string;
};

type FairwayCard = {
  name: Text;
  modificationTimestamp?: number;
};

type FairwayCardGroupProps = {
  data: FairwayCard[];
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
              <IonLabel>{t('modifiedDate', { val: new Date() })}</IonLabel>
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
  const cards: FairwayCard[] =
    data?.fairwayCards.map((card) => {
      return {
        id: card.id,
        name: {
          fi: card.name.fi || '',
          sv: card.name.sv || '',
          en: card.name.en || '',
        },
        modificationTimestamp: card.modificationTimestamp || undefined,
      };
    }) || [];
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
            <FairwayCardGroup title={t('saaristomeri')} data={cards} />
          </IonCol>
        </IonRow>
      </IonGrid>
    </IonContent>
  );
};

export default FairwayCards;
