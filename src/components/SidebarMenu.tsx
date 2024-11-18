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
  IonText,
  useIonRouter,
  IonItem,
  IonTitle,
} from '@ionic/react';
import React, { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { menuController } from '@ionic/core/components';
import vayla_logo from '../theme/img/vayla_logo.png';
import vayla_logo_en from '../theme/img/vayla_logo_en.png';
import './SidebarMenu.css';
import OfflineSupport from './OfflineSupport';
import closeIcon from '../theme/img/close_black_24dp.svg';
import fairwaysIcon from '../theme/img/fairways_icon.svg';
import alertIcon from '../theme/img/alert_icon.svg';
import weatherIcon from '../theme/img/weather_icon.svg';
import calculateIcon from '../theme/img/calculate_icon.svg';
import routeIcon from '../theme/img/route_icon.svg';
import LocationPermissionControl from './LocationPermissionControl';
import LanguageBar from './LanguageBar';
import { useDvkContext } from '../hooks/dvkContext';
import { Lang, accessibilityUrl } from '../utils/constants';

type SidebarMenuProps = {
  setIsSourceOpen: (open: boolean) => void;
  setIsFeedbackOpen: (open: boolean) => void;
};

type RouteItemProps = {
  routerLink: string;
  icon: string;
  title: string;
  dataTestId: string;
};

const RouteItem: React.FC<RouteItemProps> = ({ routerLink, icon, title, dataTestId }) => {
  const { state } = useDvkContext();
  const router = useIonRouter();

  return (
    <IonItem
      routerLink={routerLink}
      detail={false}
      lines="none"
      className={state.preview ? 'ion-no-padding internal disabled' : 'ion-no-padding internal'}
      onClick={async () => menuController.close()}
      disabled={router.routeInfo.pathname === routerLink}
      data-testid={dataTestId}
    >
      <IonIcon slot="start" src={icon} />
      {title}
    </IonItem>
  );
};

const SidebarMenu: React.FC<SidebarMenuProps> = ({ setIsSourceOpen, setIsFeedbackOpen }) => {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'homePage.sidebarMenu' });
  const firstFocusableElement = useRef<HTMLIonButtonElement>(null);
  const lastFocusableElement = useRef<HTMLIonButtonElement>(null);
  const lang = i18n.resolvedLanguage as Lang;

  const handleTabFocus = useCallback((e: KeyboardEvent) => {
    const isTabPressed = e.key === 'Tab';

    if (!isTabPressed) {
      return;
    }

    if (e.shiftKey) {
      // peruutus
      if (document.activeElement === firstFocusableElement.current) {
        lastFocusableElement.current?.setAttribute('tabIndex', '-1');
        lastFocusableElement.current?.focus();
        lastFocusableElement.current?.removeAttribute('tabIndex');
        e.preventDefault();
      }
    } else if (document.activeElement === lastFocusableElement.current) {
      // eteenpain
      firstFocusableElement.current?.setAttribute('tabIndex', '-1');
      firstFocusableElement.current?.focus();
      firstFocusableElement.current?.removeAttribute('tabIndex');
      e.preventDefault();
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleTabFocus);

    return () => {
      document.removeEventListener('keydown', handleTabFocus);
    };
  }, [handleTabFocus]);

  return (
    <IonMenu disabled={false} hidden={false} side="start" maxEdgeStart={24} content-id="MainContent" className="sideBar">
      <IonContent className="sidebarMenu">
        <IonGrid className="mainGrid ion-no-padding" style={{ height: '100%' }}>
          <IonRow className="ion-justify-content-between" style={{ height: '100%' }}>
            <IonCol>
              <IonGrid className="contentGrid ion-no-padding">
                <IonRow className="header ion-align-items-end">
                  <IonCol>
                    <IonImg className="logo" src={i18n.language === 'en' ? vayla_logo_en : vayla_logo} alt={t('logo')} />
                  </IonCol>
                  <IonCol size="auto">
                    <IonButton
                      ref={firstFocusableElement}
                      fill="clear"
                      className="closeButton"
                      onClick={async () => menuController.close()}
                      data-testid="closeMenu"
                      title={t('closeMenu')}
                      aria-label={t('closeMenu')}
                    >
                      <IonIcon className="otherIconLarge" src={closeIcon} />
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
                    <RouteItem routerLink="/kortit/" icon={fairwaysIcon} title={t('fairway-cards')} dataTestId="fairwaysLink" />
                  </IonCol>
                  <IonCol size="auto">
                    <RouteItem routerLink="/luotsausreitit/" icon={routeIcon} title={t('pilot-routes')} dataTestId="routesLink" />
                  </IonCol>
                  <IonCol size="auto">
                    <RouteItem routerLink="/turvalaiteviat/" icon={alertIcon} title={t('safety-equipment-faults')} dataTestId="faultsLink" />
                  </IonCol>
                  <IonCol size="auto">
                    <RouteItem routerLink="/merivaroitukset/" icon={weatherIcon} title={t('marine-warnings')} dataTestId="warningsLink" />
                  </IonCol>
                  <IonCol size="auto">
                    <RouteItem routerLink="/squat/" icon={calculateIcon} title={t('squat')} dataTestId="squatLink" />
                  </IonCol>
                </IonRow>
                <IonRow className="languageSelection">
                  <IonCol size="12">
                    <LanguageBar />
                  </IonCol>
                </IonRow>
                <IonRow className="locationPermission">
                  <IonCol size="12">
                    <LocationPermissionControl />
                  </IonCol>
                  {/* TODO t */}
                  <IonCol>
                    <IonButtons>
                      <IonButton
                        ref={lastFocusableElement}
                        className="sourceText ion-text-nowrap"
                        onClick={() => {
                          menuController.close();
                          setIsFeedbackOpen(true);
                        }}
                      >
                        {t('Anna palvelusta palautetta')}
                      </IonButton>
                    </IonButtons>
                  </IonCol>
                </IonRow>
              </IonGrid>
            </IonCol>
            <IonCol className="ion-align-self-end">
              <OfflineSupport />
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
      <IonFooter collapse="fade" className="small ion-no-border dvkFooter">
        <IonToolbar className="ion-no-border">
          <IonGrid className="ion-no-padding">
            <IonRow className="ion-align-items-center">
              <IonCol>
                <IonTitle>
                  <a href={accessibilityUrl[lang]} rel="noreferrer" target="_blank" className="ion-no-padding">
                    {t('accessibility')}
                  </a>
                  <IonButtons>
                    <IonButton
                      ref={lastFocusableElement}
                      className="sourceText ion-text-nowrap"
                      onClick={() => {
                        menuController.close();
                        setIsSourceOpen(true);
                      }}
                    >
                      {t('source')}
                    </IonButton>
                  </IonButtons>
                </IonTitle>
              </IonCol>
              <IonCol>
                <IonTitle className="ion-text-end ion-no-padding version">
                  <small>v{import.meta.env.VITE_APP_VERSION}</small>
                </IonTitle>
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonToolbar>
      </IonFooter>
    </IonMenu>
  );
};

export default SidebarMenu;
