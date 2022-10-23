import React from 'react';
import { IonCol, IonGrid, IonImg, IonRow, IonText } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import './TitleBar.css';
import LanguageBar from './LanguageBar';
import { showLanguages } from '../pages/Home';
import PrintBar from './PrintBar';

const TitleBar: React.FC = () => {
  const { t } = useTranslation('', { keyPrefix: 'homePage' });

  return (
    <IonGrid className="titlebar">
      <IonRow class="ion-justify-content-end">
        <IonCol class="ion-align-self-center">
          <IonText color="dark" className="equal-margin-top main-title">
            <h1>
              <strong>{t('squat.content')}</strong>
            </h1>
          </IonText>
        </IonCol>
        <IonCol class="ion-align-self-center mobile-logo" size="auto">
          <IonImg className="logo" src="assets/icon/vayla_alla_fi_sv_rgb.png" alt="Väylävirasto" />
        </IonCol>
        <IonCol class="ion-align-self-center" size="auto">
          <IonGrid>
            <IonRow>
              {showLanguages() && (
                <IonCol class="ion-align-self-center" size="auto">
                  <LanguageBar />
                </IonCol>
              )}
              <IonCol class="ion-align-self-center" size="auto">
                <PrintBar />
              </IonCol>
              <IonCol class="ion-align-self-center desktop-logo" size="auto">
                <IonImg className="logo" src="assets/icon/vayla_alla_fi_sv_rgb.png" alt="Väylävirasto" />
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};

export default TitleBar;
