import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';
import './i18n';
import i18next, { changeLanguage } from 'i18next';
import { getUrlParam } from './pages/Home';

const rootElement = document.getElementById('root');
const root = createRoot(rootElement as Element);

(async () => {
  const paramLang = getUrlParam('lang');
  if (paramLang === 'sv') {
    await changeLanguage('sv');
  } else if (paramLang === 'en') {
    await changeLanguage('en');
  } else {
    await changeLanguage('fi');
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
