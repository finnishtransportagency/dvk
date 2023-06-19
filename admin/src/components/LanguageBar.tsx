import React from 'react';
import { IonButton, IonCol, IonGrid, IonRow } from '@ionic/react';
import { useTranslation } from 'react-i18next';

const LanguageBar: React.FC = () => {
  const { i18n } = useTranslation();
  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang).catch((err) => console.error(err));
  };

  return (
    <IonGrid className="languageBar">
      <IonRow>
        <IonCol>
          <IonButton
            id="language_fi"
            fill="clear"
            className="plainButton"
            onClick={(e) => {
              changeLanguage('fi');
              e.preventDefault();
            }}
            disabled={i18n.language === 'fi'}
          >
            Suomeksi
          </IonButton>
          <IonButton
            id="language_sv"
            fill="clear"
            className="plainButton"
            onClick={(e) => {
              changeLanguage('sv');
              e.preventDefault();
            }}
            disabled={i18n.language === 'sv'}
          >
            På svenska
          </IonButton>
          <IonButton
            id="language_en"
            fill="clear"
            className="plainButton"
            onClick={(e) => {
              changeLanguage('en');
              e.preventDefault();
            }}
            disabled={i18n.language === 'en'}
          >
            In English
          </IonButton>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};

export default LanguageBar;
