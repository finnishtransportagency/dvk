import { use } from "i18next";
import { initReactI18next } from "react-i18next";

import translationFI from "./locales/fi/translation.json";
import translationSV from "./locales/sv/translation.json";
import translationEN from "./locales/en/translation.json";

const i18n = use(initReactI18next).init({
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
  lng: "fi",
  fallbackLng: "fi",
  preload: ["fi", "en", "sv"],
  debug: true,

  interpolation: {
    escapeValue: false,
  },

  react: {
    useSuspense: false,
  },
});

export default i18n;
