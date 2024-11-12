import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translationFI from './locales/fi/translation.json';
import translationSV from './locales/sv/translation.json';
import translationEN from './locales/en/translation.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    returnNull: false;
  }
}

i18n.use(initReactI18next).init({
  returnNull: false,
  resources: {
    fi: {
      translation: translationFI,
    },
    sv: {
      translation: translationSV,
    },
    en: {
      translation: translationEN,
    },
  },
  lng: 'fi',
  fallbackLng: 'fi',
  preload: ['fi', 'en', 'sv'],

  interpolation: {
    escapeValue: false,
  },

  react: {
    useSuspense: false,
  },
});

export default i18n;
