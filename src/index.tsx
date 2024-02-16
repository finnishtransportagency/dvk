import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './i18n';
import i18next, { changeLanguage } from 'i18next';
import { APP_CONFIG_PREVIEW } from './utils/constants';

const rootElement = document.getElementById('root');
const root = createRoot(rootElement as Element);
const squatLib = VITE_APP_CONFIG !== APP_CONFIG_PREVIEW ? import('squatlib') : Promise.resolve(undefined);

export function getUrlParam(param: string) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

async function setDvkLanguage(paramLang: string | null) {
  if (paramLang === 'fi') {
    await changeLanguage('fi', () => localStorage.setItem('dvkLang', 'fi'));
  } else if (paramLang === 'sv') {
    await changeLanguage('sv', () => localStorage.setItem('dvkLang', 'sv'));
  } else if (paramLang === 'en') {
    await changeLanguage('en', () => localStorage.setItem('dvkLang', 'en'));
  } else {
    const storageLang = localStorage.getItem('dvkLang');
    if (storageLang) {
      await changeLanguage(storageLang);
    }
  }
}

async function setSquatLanguage(paramLang: string | null) {
  squatLib.then((module) => {
    if (module !== undefined) {
      if (paramLang === 'fi') {
        module.changeSquatLanguage('fi');
      } else if (paramLang === 'sv') {
        module.changeSquatLanguage('sv');
      } else if (paramLang === 'en') {
        module.changeSquatLanguage('en');
      } else {
        const storageLang = localStorage.getItem('dvkLang');
        if (storageLang) {
          module.changeSquatLanguage(storageLang);
        }
      }
    }
  });
}

(async () => {
  const paramLang = getUrlParam('lang');
  await Promise.all([setDvkLanguage(paramLang), setSquatLanguage(paramLang)]);

  i18next.on('languageChanged', (lang: string) => {
    const currentLang = getUrlParam('lang');
    if (!currentLang) {
      window.history.replaceState(
        null,
        '',
        window.location.pathname + (window.location.search ? window.location.search + '&lang=' + lang : '?lang=' + lang) + window.location.hash
      );
    } else {
      window.history.replaceState(
        null,
        '',
        window.location.pathname + window.location.search.replace('lang=' + currentLang, 'lang=' + lang) + window.location.hash
      );
    }
  });

  root.render(<App />);
})();
