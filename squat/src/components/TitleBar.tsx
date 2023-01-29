import React from 'react';
import { IonCol, IonGrid, IonImg, IonRow, IonText } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import './TitleBar.css';
import LanguageBar from './LanguageBar';
import { isEmbedded, showLanguages, showLogo } from '../pages/Home';
import PrintBar from './PrintBar';

const TitleBar: React.FC = () => {
  const { t } = useTranslation('', { keyPrefix: 'homePage' });

  return (
    <IonGrid className="titlebar ion-no-padding">
      <IonRow className="ion-align-items-center">
        <IonCol className="mainTitle">
          <IonText color="dark" className="equal-margin-top">
            {!isEmbedded() && (
              <h1>
                <strong>{t('squat.content')}</strong>
              </h1>
            )}
            {isEmbedded() && (
              <h2>
                <strong>{t('squat.content')}</strong>
              </h2>
            )}
          </IonText>
        </IonCol>
        <IonCol class="ion-align-self-center mobile-logo" size="auto">
          {showLogo() && (
            <IonImg className="logo" src="assets/icon/vayla_alla_fi_sv_rgb.png" alt={t('vaylavirasto-logo')} title={t('vaylavirasto-logo')} />
          )}
        </IonCol>
        <IonCol className="langbar" style={{ textAlign: 'end' }}>
          {showLanguages() && <LanguageBar />}
        </IonCol>
        <IonCol size="auto">
          <IonGrid>
            <IonRow>
              <IonCol className="ion-align-self-center">
                <PrintBar />
              </IonCol>
              {showLogo() && (
                <IonCol className="ion-align-self-center desktop-logo" size="auto">
                  <IonImg className="logo" src="assets/icon/vayla_alla_fi_sv_rgb.png" alt={t('vaylavirasto-logo')} title={t('vaylavirasto-logo')} />
                </IonCol>
              )}
            </IonRow>
          </IonGrid>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};

export default TitleBar;
