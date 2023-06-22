import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';
import './i18n';
import i18next, { changeLanguage } from 'i18next';

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

  // If you want your app to work offline and load faster, you can change
  // unregister() to register() below. Note this comes with some pitfalls.
  // Learn more about service workers: https://cra.link/PWA
  serviceWorkerRegistration.register({
    onUpdate: (registration: ServiceWorkerRegistration) => {
      registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
    },
  });

  // If you want to start measuring performance in your app, pass a function
  // to log results (for example: reportWebVitals(console.log))
  // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
  reportWebVitals();
})();
