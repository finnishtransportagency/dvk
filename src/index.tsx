import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './i18n';
import i18next, { changeLanguage } from 'i18next';
// import { changeSquatLanguage } from 'squatlib';
import { APP_CONFIG_PREVIEW } from './utils/constants';

const rootElement = document.getElementById('root');
const root = createRoot(rootElement as Element);

export function getUrlParam(param: string) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

(async () => {
  const paramLang = getUrlParam('lang');
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

  if (VITE_APP_CONFIG !== APP_CONFIG_PREVIEW) {
    const squatlib = await import('squatlib');
    if (paramLang === 'fi') {
      await squatlib.changeSquatLanguage('fi');
    } else if (paramLang === 'sv') {
      await squatlib.changeSquatLanguage('sv');
    } else if (paramLang === 'en') {
      await squatlib.changeSquatLanguage('en');
    } else {
      const storageLang = localStorage.getItem('dvkLang');
      if (storageLang) {
        await squatlib.changeSquatLanguage(storageLang);
      }
    }
  }

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
