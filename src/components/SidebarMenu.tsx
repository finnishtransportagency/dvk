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
import LocationPermissionControl from './LocationPermissionControl';
import LanguageBar from './LanguageBar';

type SidebarMenuProps = {
  isSourceOpen: boolean;
  setIsSourceOpen: (open: boolean) => void;
};

const SidebarMenu: React.FC<SidebarMenuProps> = ({ setIsSourceOpen }) => {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'homePage.sidebarMenu' });
  const router = useIonRouter();
  const firstFocusableElement = useRef<HTMLIonButtonElement>(null);
  const lastFocusableElement = useRef<HTMLIonButtonElement>(null);

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
    } else {
      // eteenpain
      if (document.activeElement === lastFocusableElement.current) {
        firstFocusableElement.current?.setAttribute('tabIndex', '-1');
        firstFocusableElement.current?.focus();
        firstFocusableElement.current?.removeAttribute('tabIndex');
        e.preventDefault();
      }
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
                    <IonItem
                      routerLink="/kortit/"
                      detail={false}
                      lines="none"
                      className="ion-no-padding internal"
                      onClick={async () => menuController.close()}
                      disabled={router.routeInfo.pathname === '/kortit/'}
                      data-testid="fairwaysLink"
                    >
                      <IonIcon slot="start" src={fairwaysIcon} />
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
                      <IonIcon slot="start" src={alertIcon} />
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
                      <IonIcon slot="start" src={weatherIcon} />
                      {t('marine-warnings')}
                    </IonItem>
                  </IonCol>
                  <IonCol size="auto">
                    <IonItem
                      id="squatlink"
                      routerLink="/squat/"
                      detail={false}
                      lines="none"
                      className="ion-no-padding internal"
                      onClick={async () => menuController.close()}
                      data-testid="squatLink"
                      disabled={router.routeInfo.pathname === '/squat/'}
                    >
                      <IonIcon slot="start" src={calculateIcon} />
                      {t('squat')}
                    </IonItem>
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
                  <IonButtons>
                    <IonButton
                      ref={lastFocusableElement}
                      className="sourceText"
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
              <IonCol className="ion-text-end">
                <IonTitle>
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
