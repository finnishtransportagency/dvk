import React from 'react';
import { IonCol, IonGrid, IonImg, IonRow, IonText } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import './TitleBar.css';
import LanguageBar from './LanguageBar';
import { showLanguages } from '../pages/Home';
import { useWindowWidth } from '@react-hook/window-size';
import PrintBar from './PrintBar';

const TitleBar: React.FC = () => {
  const { t } = useTranslation('', { keyPrefix: 'homePage' });
  const windowWidth = useWindowWidth();

  return (
    <IonGrid className="titlebar">
      {windowWidth > 800 && (
        <IonRow>
          <IonCol class="ion-align-self-center">
            <IonText color="dark" className="equal-margin-top main-title">
              <h1>
                <strong>{t('squat.content')}</strong>
              </h1>
            </IonText>
          </IonCol>
          {showLanguages() && (
            <IonCol class="ion-align-self-center" style={{ textAlign: 'end' }} size="auto">
              <LanguageBar />
            </IonCol>
          )}
          <IonCol size="auto" className="ion-align-self-center">
            <IonGrid>
              <IonRow>
                <PrintBar />
                <IonCol class="ion-align-self-center">
                  <IonImg className="logo" src="assets/icon/vayla_alla_fi_sv_rgb.png" alt="Väylävirasto" />
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonCol>
        </IonRow>
      )}
      {windowWidth <= 800 && (
        <>
          <IonRow>
            <IonCol class="ion-align-self-center">
              <IonText color="dark" className="equal-margin-top main-title">
                <h1>
                  <strong>{t('squat.content')}</strong>
                </h1>
              </IonText>
            </IonCol>
            <IonCol class="ion-align-self-center">
              <IonImg className="logo" src="assets/icon/vayla_alla_fi_sv_rgb.png" alt="Väylävirasto" />
            </IonCol>
          </IonRow>
          <IonRow>
            {showLanguages() && (
              <>
                <IonCol class="ion-align-self-center" style={{ textAlign: 'end', whiteSpace: 'nowrap' }}>
                  <LanguageBar />
                </IonCol>
                <IonCol class="ion-align-self-center" size="auto">
                  <PrintBar />
                </IonCol>
              </>
            )}
          </IonRow>
        </>
      )}
    </IonGrid>
  );
};

export default TitleBar;
