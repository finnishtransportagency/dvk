import React, { Dispatch, SetStateAction, useEffect } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import MainContent from '../components/content/MainContent';
import { useDocumentTitle } from '../hooks/dvkDocumentTitle';
import { isMobile } from '../utils/common';
import MainContentWithModal from '../components/content/MainContentWithModal';
import { marineWarningLayers } from '../utils/constants';
import { useDvkContext } from '../hooks/dvkContext';

interface ModalProps {
  setModalContent: Dispatch<SetStateAction<string>>;
}

const MarineWarningPage: React.FC<ModalProps> = ({ setModalContent }) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'common' });
  const title = t('documentTitle') + ' - ' + t('marine-warnings');
  const [, setDocumentTitle] = useDocumentTitle(title);
  const { state, dispatch } = useDvkContext();

  useEffect(() => {
    const hiddenMarineWarningLayers = marineWarningLayers.filter((l) => !state.layers.includes(l));
    if (hiddenMarineWarningLayers.length > 0) {
      dispatch({ type: 'setLayers', payload: { value: [...state.layers, ...hiddenMarineWarningLayers] } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  useEffect(() => {
    setDocumentTitle(title);
  }, [setDocumentTitle, title]);

  useEffect(() => {
    setModalContent('marineWarningList');
  }, [setModalContent]);

  return (
    <IonPage id="mainContent">
      <IonContent>
        {isMobile() && <MainContentWithModal />}
        {!isMobile() && <MainContent splitPane target="warnings" />}
      </IonContent>
    </IonPage>
  );
};

export default MarineWarningPage;
