import { IonContent, IonGrid, IonRow, IonCol, IonLabel, IonInput, IonBreadcrumbs, IonBreadcrumb, IonSplitPane, IonMenu, IonText } from '@ionic/react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './FairwayCards.css';
import { FairwayCardPartsFragment, useFindAllFairwayCardsQuery } from '../graphql/generated';
import { menuController } from '@ionic/core/components';
import MapContainer from './MapContainer';
import { ReactComponent as ChevronIcon } from '../theme/img/chevron.svg';
import { ReactComponent as MenuIcon } from '../theme/img/menu.svg';

type FairwayCardGroupProps = {
  data: FairwayCardPartsFragment[];
  title: string;
};

const FairwayCardGroup: React.FC<FairwayCardGroupProps> = ({ data, title }) => {
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
    </>
  );
};

const FairwayCards: React.FC = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });
  const { data } = useFindAllFairwayCardsQuery();
  const [widePane, setWidePane] = useState(false);

  const togglePane = () => {
    setWidePane(!widePane);
  };

  return (
    <IonSplitPane when={true} contentId="mapPane" id="splitPane" className={widePane ? 'wide' : ''}>
      <IonMenu id="fairwayPane" className="menu-enabled" contentId="mapPane">
        <IonContent id="fairwayCardsContainer">
          <IonGrid className="ion-no-padding">
            <IonRow className="ion-align-items-center">
              <IonCol size="auto">
                <button className="icon" onClick={() => menuController.open()}>
                  <MenuIcon />
                </button>
              </IonCol>
              <IonCol className="ion-margin-start">
                <IonInput className="searchBar" placeholder={t('search')} />
              </IonCol>
              <IonCol size="auto">
                {/*<IonButton
                  fill="clear"
                  className="icon-only"
                  onClick={() => togglePane()}
                  title={t('enlarge')}
                  aria-label={t('enlarge')}
                  role="button"
                >
                  <IonIcon color="primary" slot="icon-only" icon={chevronForwardOutline} />
                </IonButton>*/}
                <button className={'icon ' + (widePane ? 'flip invert' : '')} onClick={() => togglePane()}>
                  <ChevronIcon />
                </button>
              </IonCol>
            </IonRow>
          </IonGrid>

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
          <IonText>
            <p>
              <strong>{t('description')}</strong>
            </p>
          </IonText>

          <FairwayCardGroup title={t('archipelagoSea')} data={data?.fairwayCards.filter((card) => card.group === '1') || []} />
          <FairwayCardGroup title={t('gulfOfFinland')} data={data?.fairwayCards.filter((card) => card.group === '2') || []} />
          <FairwayCardGroup title={t('gulfOfBothnia')} data={data?.fairwayCards.filter((card) => card.group === '3') || []} />
        </IonContent>
      </IonMenu>

      <div className="ion-page" id="mapPane">
        <IonContent>
          <MapContainer hideMenu />
        </IonContent>
      </div>
    </IonSplitPane>
  );
};

export default FairwayCards;
