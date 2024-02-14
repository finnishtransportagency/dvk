import { IonButtons, IonButton } from '@ionic/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import './SidebarMenu.css';
import { APP_CONFIG_PREVIEW } from '../utils/constants';

const squatLib = VITE_APP_CONFIG !== APP_CONFIG_PREVIEW ? import('squatlib') : Promise.resolve(undefined);

const LanguageBar: React.FC = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (e: React.MouseEvent<HTMLIonButtonElement, MouseEvent>, lang: string) => {
    i18n.changeLanguage(lang, () => localStorage.setItem('dvkLang', lang));
    squatLib.then((module) => {
      if (module !== undefined) module.changeSquatLanguage(lang);
    });

    e.preventDefault();
  };

  return (
    <IonButtons className="ion-justify-content-around">
      <IonButton className="languageSelection" onClick={(e) => changeLanguage(e, 'fi')} disabled={i18n.language === 'fi'} data-testid="langFi">
        Suomeksi
      </IonButton>
      <IonButton className="languageSelection" onClick={(e) => changeLanguage(e, 'sv')} disabled={i18n.language === 'sv'} data-testid="langSv">
        På svenska
      </IonButton>
      <IonButton className="languageSelection" onClick={(e) => changeLanguage(e, 'en')} disabled={i18n.language === 'en'} data-testid="langEn">
        In English
      </IonButton>
    </IonButtons>
  );
};

export default LanguageBar;
