import { IonButtons, IonButton, IonContent, IonIcon, IonImg, IonMenu, IonGrid, IonRow, IonCol, IonLabel } from '@ionic/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { menuController } from '@ionic/core/components';
import vayla_logo from '../theme/img/vayla_logo.png';
import close from '../theme/img/close.svg';
import './SidebarMenu.css';
import { useFindAllFairwayCardsQuery } from '../graphql/generated';

const SidebarMenu: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { data } = useFindAllFairwayCardsQuery();
  const lang = i18n.resolvedLanguage as 'fi' | 'sv' | 'en';
  return (
    <IonMenu disabled={false} hidden={false} side="start" content-id="MainContent">
      <IonContent className="sidebarMenu">
        <IonGrid className="ion-no-padding">
          <IonRow className="header">
            <IonCol>
              <IonImg className="logo" src={vayla_logo} alt="Väylävirasto" />
            </IonCol>
            <IonCol size="2">
              <IonButton fill="clear" color="#000000" className="closeButton" onClick={async () => menuController.close()}>
                <IonIcon className="otherIconLarge" icon={close} />
              </IonButton>
            </IonCol>
          </IonRow>
          <IonRow className="title">
            <IonCol>{t('homePage.sidebarMenu.title')}</IonCol>
          </IonRow>
          <IonRow className="languageSelection">
            <IonCol>
              <IonButtons>
                <IonButton onClick={() => i18n.changeLanguage('fi')}>FI</IonButton>
                <IonButton onClick={() => i18n.changeLanguage('en')}>EN</IonButton>
                <IonButton onClick={() => i18n.changeLanguage('sv')}>SV</IonButton>
              </IonButtons>
            </IonCol>
          </IonRow>
          {/* For proxy routing testing */}
          {data?.fairwayCards.map((fairwayCard, idx) => {
            return (
              <IonRow key={idx} className="fairwayCards">
                <IonCol>
                  <IonLabel>{fairwayCard.name[lang]}</IonLabel>
                </IonCol>
              </IonRow>
            );
          })}
        </IonGrid>
      </IonContent>
    </IonMenu>
  );
};

export default SidebarMenu;
