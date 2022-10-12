import React from 'react';
import { IonButton, IonCol, IonGrid, IonRow } from '@ionic/react';
import { useTranslation } from 'react-i18next';

const LanguageBar: React.FC = () => {
  const { i18n } = useTranslation();
  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <IonGrid>
      <IonRow>
        <IonCol>
          <IonButton
            className="languageSelection"
            fill="clear"
            onClick={(e) => {
              changeLanguage('fi');
              e.preventDefault();
            }}
            disabled={i18n.language === 'fi'}
          >
            Suomi
          </IonButton>
          <IonButton
            className="languageSelection"
            fill="clear"
            onClick={(e) => {
              changeLanguage('sv');
              e.preventDefault();
            }}
            disabled={i18n.language === 'sv'}
          >
            Svenska
          </IonButton>
          <IonButton
            className="languageSelection"
            fill="clear"
            onClick={(e) => {
              changeLanguage('en');
              e.preventDefault();
            }}
            disabled={i18n.language === 'en'}
          >
            English
          </IonButton>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};

export default LanguageBar;
