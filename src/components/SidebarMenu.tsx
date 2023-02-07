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
import OfflineSupport from './OfflineSupport';
import { useDvkContext } from '../hooks/dvkContext';

export const LanguageBar: React.FC = () => {
  const { i18n } = useTranslation();
  return (
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
  );
};

const SidebarMenu: React.FC = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'homePage.sidebarMenu' });
  const router = useIonRouter();
  const { state } = useDvkContext();

  return (
    <IonMenu disabled={false} hidden={false} side="start" maxEdgeStart={24} content-id="MainContent" className="sideBar">
      <IonContent className="sidebarMenu">
        <IonGrid className="ion-no-padding">
          <IonRow className="header ion-align-items-end">
            <IonCol>
              <IonImg className="logo" src={vayla_logo} alt="Väylävirasto" />
            </IonCol>
            <IonCol size="auto">
              <IonButton
                fill="clear"
                className="closeButton"
                onClick={async () => menuController.close()}
                data-testid="closeMenu"
                title={t('closeMenu')}
                aria-label={t('closeMenu')}
              >
                <IonIcon className="otherIconLarge" src="/assets/icon/close_black_24dp.svg" />
              </IonButton>
            </IonCol>
          </IonRow>
          <IonRow className="title">
            <IonCol>
              <IonText>
                <h1>{t('title')}</h1>
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
                {t('fairway-cards')}
              </IonItem>
            </IonCol>
            <IonCol size="auto">
              <IonItem
                routerLink="/turvalaiteviat/"
                detail={false}
                lines="none"
                className="ion-no-padding internal"
                onClick={async () => menuController.close()}
                disabled={router.routeInfo.pathname === '/turvalaiteviat/'}
                data-testid="faultsLink"
              >
                <IonIcon slot="start" src="/assets/icon/alert_icon.svg" />
                {t('safety-equipment-faults')}
              </IonItem>
            </IonCol>
            <IonCol size="auto">
              <IonItem
                routerLink="/merivaroitukset/"
                detail={false}
                lines="none"
                className="ion-no-padding internal"
                onClick={async () => menuController.close()}
                disabled={router.routeInfo.pathname === '/merivaroitukset/'}
                data-testid="warningsLink"
              >
                <IonIcon slot="start" src="/assets/icon/weather_icon.svg" />
                {t('marine-warnings')}
              </IonItem>
            </IonCol>
            <IonCol size="auto">
              <IonItem
                href={t('squat-url')}
                rel="external"
                target="_blank"
                detail={false}
                lines="none"
                className="ion-no-padding external"
                onClick={async () => menuController.close()}
                data-testid="squatLink"
                disabled={state.isOffline}
                tabIndex={state.isOffline ? -1 : undefined}
              >
                <IonIcon slot="start" src="/assets/icon/calculate_icon.svg" />
                {t('squat')}
                <IonIcon slot="end" src="/assets/icon/ext_link.svg" />
              </IonItem>
            </IonCol>
          </IonRow>
          <IonRow className="languageSelection">
            <IonCol size="12">
              <LanguageBar />
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>

      <IonFooter collapse="fade" className="small ion-no-border">
        <OfflineSupport />
        <IonToolbar>
          <IonTitle size="small" slot="end">
            <small>Beta v{`${process.env.REACT_APP_VERSION}`}</small>
          </IonTitle>
        </IonToolbar>
      </IonFooter>
    </IonMenu>
  );
};

export default SidebarMenu;
