import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';
import './i18n';
import i18next, { changeLanguage } from 'i18next';

const rootElement = document.getElementById('root');
const root = createRoot(rootElement as Element);

(async () => {
  const items = window.location.pathname.split('/');

  if (items.includes('sv')) {
    await changeLanguage('sv');
  } else if (items.includes('en')) {
    await changeLanguage('en');
  } else {
    await changeLanguage('fi');
  }

  i18next.on('languageChanged', (lang: string) => {
    const dirs = window.location.pathname.split('/');

    const newDirs = dirs.map((dir) => {
      if (dir === 'fi' || dir === 'sv' || dir === 'en') {
        return lang;
      }
      return dir;
    });

    let newPath = newDirs.join('/');

    if (!newDirs.includes(lang)) {
      newPath += lang;
    }

    window.history.replaceState(null, '', newPath + window.location.search + window.location.hash);
  });

  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  // If you want your app to work offline and load faster, you can change
  // unregister() to register() below. Note this comes with some pitfalls.
  // Learn more about service workers: https://cra.link/PWA
  serviceWorkerRegistration.register();

  // If you want to start measuring performance in your app, pass a function
  // to log results (for example: reportWebVitals(console.log))
  // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
  reportWebVitals();
})();
