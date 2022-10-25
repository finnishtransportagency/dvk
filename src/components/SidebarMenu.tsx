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
  useIonRouter,
  IonText,
} from '@ionic/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { menuController } from '@ionic/core/components';
import vayla_logo from '../theme/img/vayla_logo.png';
import close from '../theme/img/close.svg';
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
              <IonButton fill="clear" color="#000000" className="closeButton" onClick={async () => menuController.close()}>
                <IonIcon className="otherIconLarge" icon={close} />
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
          <IonRow>
            <IonCol size="12">
              <IonButton
                fill="clear"
                className="sidebarButton"
                onClick={async (e) => {
                  e.preventDefault();
                  await menuController.close();
                  router.push('/vaylakortit/');
                }}
              >
                <IonIcon slot="start" src="/assets/icon/fairways_icon.svg" />
                {t('homePage.sidebarMenu.fairway-cards')}
              </IonButton>
            </IonCol>
            <IonCol size="12">
              <IonButton
                fill="clear"
                className="sidebarButton"
                onClick={(e) => {
                  e.preventDefault();
                  window.open('/squat/', '_blank');
                }}
              >
                <IonIcon slot="start" src="/assets/icon/squat_icon.svg" />
                {t('homePage.sidebarMenu.squat')}
                <IonIcon slot="end" src="/assets/icon/ext_link.svg" style={{ width: '10px' }} />
              </IonButton>
            </IonCol>
          </IonRow>
          <IonRow className="languageSelection">
            <IonCol size="12">
              <IonButtons className="ion-justify-content-around">
                <IonButton
                  className="sidebarButton"
                  onClick={(e) => {
                    i18n.changeLanguage('fi');
                    e.preventDefault();
                  }}
                  disabled={i18n.language === 'fi'}
                >
                  Suomeksi
                </IonButton>
                <IonButton
                  className="sidebarButton"
                  onClick={(e) => {
                    i18n.changeLanguage('sv');
                    e.preventDefault();
                  }}
                  disabled={i18n.language === 'sv'}
                >
                  På svenska
                </IonButton>
                <IonButton
                  className="sidebarButton"
                  onClick={(e) => {
                    i18n.changeLanguage('en');
                    e.preventDefault();
                  }}
                  disabled={i18n.language === 'en'}
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
