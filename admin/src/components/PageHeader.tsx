import React, { useRef, useState } from 'react';
import { IonButton, IonCol, IonFooter, IonGrid, IonHeader, IonImg, IonModal, IonRow, IonText, IonTitle, IonToolbar } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { useCurrentUserQueryData } from '../graphql/api';
import vayla_logo from '../theme/img/vayla_logo.png';
import vayla_logo_en from '../theme/img/vayla_logo_en.png';
import CloseIcon from '../theme/img/close_black_24dp.svg?react';

interface ModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const LogoutModal: React.FC<ModalProps> = ({ isOpen, setIsOpen }) => {
  const { t } = useTranslation();

  const modal = useRef<HTMLIonModalElement>(null);

  const closeModal = () => {
    setIsOpen(false);
    modal.current?.dismiss().catch((err) => console.error(err));
  };
  const logoutAction = () => {
    modal.current?.dismiss().catch((err) => console.error(err));
  };

  return (
    <IonModal ref={modal} isOpen={isOpen} className="prompt" onDidDismiss={() => closeModal()}>
      <IonHeader>
        <div className="gradient-top" />
        <IonToolbar className="titleBar">
          <IonTitle>
            <div className="wrappable-title">{t('modal.logout-title')}</div>
          </IonTitle>
          <IonButton
            slot="end"
            onClick={() => closeModal()}
            fill="clear"
            className="closeButton"
            title={t('general.close') ?? ''}
            aria-label={t('general.close') ?? ''}
          >
            <CloseIcon />
          </IonButton>
        </IonToolbar>
      </IonHeader>
      <IonGrid>
        <IonRow className="content">
          <IonCol>
            <IonText>
              <p>{t('modal.logout-description')}</p>
            </IonText>
          </IonCol>
        </IonRow>
      </IonGrid>
      <IonFooter>
        <IonToolbar className="buttonBar">
          <IonButton slot="end" onClick={() => closeModal()} shape="round" className="invert">
            {t('general.cancel')}
          </IonButton>
          <IonButton href="/yllapito/api/logout" slot="end" onClick={() => logoutAction()} shape="round">
            {t('header.logout')}
          </IonButton>
        </IonToolbar>
      </IonFooter>
    </IonModal>
  );
};

const UserInfo = () => {
  const { t } = useTranslation();
  const { data } = useCurrentUserQueryData();

  const [isOpen, setIsOpen] = useState(false);

  const showLogoutPrompt = () => {
    setIsOpen(true);
  };

  return (
    <>
      <IonGrid className="ion-no-padding userInfo">
        <IonRow>
          <IonCol size="auto">
            <IonText>
              <strong data-testid="currentUser">{data?.currentUser?.name}</strong>
            </IonText>
          </IonCol>
        </IonRow>
        <IonRow>
          <IonButton fill="clear" className="plainButton" data-testid="logoutButton" onClick={() => showLogoutPrompt()}>
            {t('header.logout')}
          </IonButton>
        </IonRow>
      </IonGrid>
      <LogoutModal isOpen={isOpen} setIsOpen={setIsOpen} />
    </>
  );
};

const PageHeader: React.FC = () => {
  const { t, i18n } = useTranslation();

  return (
    <IonHeader className="page-header">
      <a
        href="#mainPageContent"
        onClick={(e) => {
          e.currentTarget.blur();
          document.getElementById('mainPageContent')?.setAttribute('tabIndex', '-1');
          document.getElementById('mainPageContent')?.focus({ preventScroll: false });
          e.preventDefault();
        }}
        className="skip-to-main-content"
      >
        {t('header.skip-to-content')}
      </a>
      <IonGrid className="ion-no-padding">
        <IonRow className="ion-align-items-center">
          <IonCol size="auto">
            <IonImg className="logo" src={i18n.language === 'en' ? vayla_logo_en : vayla_logo} alt={t('header.logo')} />
          </IonCol>
          <IonCol>
            <IonText>
              <h1>
                {t('header.mainTitle')} - {t('header.appTitle')} <small>v{import.meta.env.VITE_APP_VERSION}</small>
              </h1>
              {import.meta.env.VITE_APP_ENV !== 'prod' && <h2>{t('general.environment-' + import.meta.env.VITE_APP_ENV)}</h2>}
            </IonText>
          </IonCol>
          <IonCol size="auto">{/*<LanguageBar />*/}</IonCol>
          <IonCol size="auto">
            <UserInfo />
          </IonCol>
        </IonRow>
      </IonGrid>
    </IonHeader>
  );
};

export default PageHeader;
