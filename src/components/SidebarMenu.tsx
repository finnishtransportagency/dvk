import {
  IonButtons,
  IonButton,
  IonContent,
  IonIcon,
  IonImg,
  IonMenu,
  IonGrid,
  IonRow,
  IonCol,
  IonFooter,
  IonToolbar,
  IonTitle,
  IonText,
  useIonRouter,
  IonItem,
} from '@ionic/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { menuController } from '@ionic/core/components';
import vayla_logo from '../theme/img/vayla_logo.png';
import './SidebarMenu.css';

const SidebarMenu: React.FC = () => {
  const { t, i18n } = useTranslation();
  const router = useIonRouter();

  return (
    <IonMenu disabled={false} hidden={false} side="start" maxEdgeStart={24} content-id="MainContent" className="sideBar">
      <IonContent className="sidebarMenu">
        <IonGrid className="ion-no-padding">
          <IonRow className="header ion-align-items-end">
            <IonCol>
              <IonImg className="logo" src={vayla_logo} alt="Väylävirasto" />
            </IonCol>
            <IonCol size="auto">
              <IonButton fill="clear" className="closeButton" onClick={async () => menuController.close()} data-testid="closeMenu">
                <IonIcon className="otherIconLarge" src="/assets/icon/close_black_24dp.svg" />
              </IonButton>
            </IonCol>
          </IonRow>
          <IonRow className="title">
            <IonCol>
              <IonText>
                <h1>{t('homePage.sidebarMenu.title')}</h1>
              </IonText>
            </IonCol>
          </IonRow>
          <IonRow className="ion-direction-column">
            <IonCol size="auto">
              <IonItem
                routerLink="/vaylakortit/"
                detail={false}
                lines="none"
                className="ion-no-padding internal"
                onClick={async () => menuController.close()}
                disabled={router.routeInfo.pathname === '/vaylakortit/'}
                data-testid="fairwaysLink"
              >
                <IonIcon slot="start" src="/assets/icon/fairways_icon.svg" />
                {t('homePage.sidebarMenu.fairway-cards')}
              </IonItem>
            </IonCol>
            <IonCol size="auto">
              <IonItem
                href="/squat/"
                rel="external"
                target="_blank"
                detail={false}
                lines="none"
                className="ion-no-padding external"
                onClick={async () => menuController.close()}
                data-testid="squatLink"
              >
                <IonIcon slot="start" src="/assets/icon/squat_icon.svg" />
                {t('homePage.sidebarMenu.squat')}
                <IonIcon slot="end" src="/assets/icon/ext_link.svg" />
              </IonItem>
            </IonCol>
          </IonRow>
          <IonRow className="languageSelection">
            <IonCol size="12">
              <IonButtons className="ion-justify-content-around">
                <IonButton
                  className="languageSelection"
                  onClick={(e) => {
                    i18n.changeLanguage('fi');
                    e.preventDefault();
                  }}
                  disabled={i18n.language === 'fi'}
                  data-testid="langFi"
                >
                  Suomeksi
                </IonButton>
                <IonButton
                  className="languageSelection"
                  onClick={(e) => {
                    i18n.changeLanguage('sv');
                    e.preventDefault();
                  }}
                  disabled={i18n.language === 'sv'}
                  data-testid="langSv"
                >
                  På svenska
                </IonButton>
                <IonButton
                  className="languageSelection"
                  onClick={(e) => {
                    i18n.changeLanguage('en');
                    e.preventDefault();
                  }}
                  disabled={i18n.language === 'en'}
                  data-testid="langEn"
                >
                  In English
                </IonButton>
              </IonButtons>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>

      <IonFooter collapse="fade" className="small">
        <IonToolbar>
          <IonTitle size="small" slot="end">
            <small>v{`${process.env.REACT_APP_VERSION}`}</small>
          </IonTitle>
        </IonToolbar>
      </IonFooter>
    </IonMenu>
  );
};

export default SidebarMenu;
