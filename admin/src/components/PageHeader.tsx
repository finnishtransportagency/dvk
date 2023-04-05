import React, { useRef, useState } from 'react';
import { IonButton, IonCol, IonFooter, IonGrid, IonHeader, IonImg, IonModal, IonRow, IonText, IonTitle, IonToolbar } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { useCurrentUserQueryData } from '../graphql/api';
import LanguageBar from './LanguageBar';
import vayla_logo from '../theme/img/vayla_logo.png';
import { ReactComponent as CloseIcon } from '../theme/img/close_black_24dp.svg';

interface ModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const LogoutModal: React.FC<ModalProps> = ({ isOpen, setIsOpen }) => {
  const { t } = useTranslation();

  const modal = useRef<HTMLIonModalElement>(null);

  const closeModal = () => {
    setIsOpen(false);
    modal.current?.dismiss();
  };
  const logoutAction = () => {
    modal.current?.dismiss();
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
            title={t('general.close') || ''}
            aria-label={t('general.close') || ''}
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
          <IonButton slot="end" size="large" onClick={() => closeModal()} shape="round" className="invert">
            {t('general.cancel')}
          </IonButton>
          <IonButton href="/yllapito/api/logout" slot="end" size="large" onClick={() => logoutAction()} shape="round">
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
  const { t } = useTranslation();

  return (
    <IonHeader>
      <IonGrid className="ion-no-padding">
        <IonRow className="ion-align-items-center">
          <IonCol size="auto">
            <IonImg className="logo" src={vayla_logo} alt="Väylävirasto" />
          </IonCol>
          <IonCol>
            <IonText>
              <h1>
                {t('header.mainTitle')} - {t('header.appTitle')} <small>(v{`${process.env.REACT_APP_VERSION}`})</small>
              </h1>
              {process.env.REACT_APP_ENV !== 'prod' && <h2>{t('general.environment-' + process.env.REACT_APP_ENV)}</h2>}
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
