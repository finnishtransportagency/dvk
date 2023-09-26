import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './i18n';
import i18next, { changeLanguage } from 'i18next';
import { changeSquatLanguage } from 'squatlib';

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
    await changeSquatLanguage('fi');
  } else if (paramLang === 'sv') {
    await changeLanguage('sv', () => localStorage.setItem('dvkLang', 'sv'));
    await changeSquatLanguage('sv');
  } else if (paramLang === 'en') {
    await changeLanguage('en', () => localStorage.setItem('dvkLang', 'en'));
    await changeSquatLanguage('en');
  } else {
    const storageLang = localStorage.getItem('dvkLang');
    if (storageLang) {
      await changeLanguage(storageLang);
      await changeSquatLanguage(storageLang);
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
