import React from 'react';
import { IonButton, IonCol, IonGrid, IonHeader, IonImg, IonRow, IonText } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { useCurrentUserQueryData } from '../graphql/api';
import LanguageBar from './LanguageBar';
import vayla_logo from '../theme/img/vayla_logo.png';

const PageHeader: React.FC = () => {
  const { t } = useTranslation();

  const UserInfo = () => {
    const { data } = useCurrentUserQueryData();

    const logoutAction = () => {
      console.warn('TODO: Trigger action logout');
    };

    return (
      <IonGrid className="ion-no-padding userInfo">
        <IonRow>
          <IonCol size="auto">
            <IonText>
              <strong data-testid="currentUser">{data?.currentUser?.name}</strong>
            </IonText>
          </IonCol>
        </IonRow>
        <IonRow>
          <IonButton fill="clear" className="plainButton" data-testid="logoutButton" onClick={() => logoutAction()}>
            {t('header.logout')}
          </IonButton>
        </IonRow>
      </IonGrid>
    );
  };

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
            </IonText>
          </IonCol>
          <IonCol size="auto">
            <LanguageBar />
          </IonCol>
          <IonCol size="auto">
            <UserInfo />
          </IonCol>
        </IonRow>
      </IonGrid>
    </IonHeader>
  );
};

export default PageHeader;
