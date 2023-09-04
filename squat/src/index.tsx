import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './i18n';
import i18next, { changeLanguage } from 'i18next';
import { getUrlParam } from './pages/Home';

const rootElement = document.getElementById('root');
const root = createRoot(rootElement as Element);

(async () => {
  const paramLang = getUrlParam('lang');
  if (paramLang === 'fi') {
    await changeLanguage('fi', () => localStorage.setItem('squatLang', 'fi'));
  } else if (paramLang === 'sv') {
    await changeLanguage('sv', () => localStorage.setItem('squatLang', 'sv'));
  } else if (paramLang === 'en') {
    await changeLanguage('en', () => localStorage.setItem('squatLang', 'en'));
  } else {
    const storageLang = localStorage.getItem('squatLang');
    if (storageLang) {
      await changeLanguage(storageLang);
    }
  }

  i18next.on('languageChanged', (lang: string) => {
    const currentLang = getUrlParam('lang');
    if (!currentLang) {
      window.history.replaceState(
        null,
        '',
        'index.html' + (window.location.search ? window.location.search + '&lang=' + lang : '?lang=' + lang) + window.location.hash
      );
    } else {
      window.history.replaceState(
        null,
        '',
        'index.html' + window.location.search.replace('lang=' + currentLang, 'lang=' + lang) + window.location.hash
      );
    }
  });

  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
})();
