import React from 'react';
import { IonButton, IonCol, IonGrid, IonRow } from '@ionic/react';
import { useTranslation } from 'react-i18next';

const LanguageBar: React.FC = () => {
  const { i18n } = useTranslation();
  const changeLanguage = (e: React.MouseEvent<HTMLIonButtonElement, MouseEvent>, lang: string) => {
    i18n
      .changeLanguage(lang)
      .then(() => localStorage.setItem('adminLang', lang))
      .catch((err) => console.error(err));
    e.preventDefault();
  };

  return (
    <IonGrid className="languageBar">
      <IonRow>
        <IonCol>
          <IonButton id="language_fi" fill="clear" className="plainButton" onClick={(e) => changeLanguage(e, 'fi')} disabled={i18n.language === 'fi'}>
            Suomeksi
          </IonButton>
          <IonButton id="language_sv" fill="clear" className="plainButton" onClick={(e) => changeLanguage(e, 'sv')} disabled={i18n.language === 'sv'}>
            På svenska
          </IonButton>
          <IonButton id="language_en" fill="clear" className="plainButton" onClick={(e) => changeLanguage(e, 'en')} disabled={i18n.language === 'en'}>
            In English
          </IonButton>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};

export default LanguageBar;
