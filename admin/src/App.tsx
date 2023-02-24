import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { IonApp, setupIonicReact } from '@ionic/react';
import PageHeader from './components/PageHeader';
import { useTranslation } from 'react-i18next';
import { Lang } from './utils/constants';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import './theme/dvk.css';

setupIonicReact({
  mode: 'md',
});

const queryClient = new QueryClient();

const AdminIonApp: React.FC = () => {
  return (
    <IonApp>
      <PageHeader />
    </IonApp>
  );
};

function App() {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage as Lang;

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = t('header.mainTitle') + ' - ' + t('header.appTitle');
  }, [t, lang]);

  return (
    <QueryClientProvider client={queryClient}>
      <AdminIonApp />
    </QueryClientProvider>
  );
}

export default App;
