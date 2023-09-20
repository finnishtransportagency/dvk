import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
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
  const [initialLayers] = useState<string[]>(state.layers);

  useEffect(() => {
    const hiddenMarineWarningLayers = marineWarningLayers.filter((l) => !initialLayers.includes(l));
    if (hiddenMarineWarningLayers.length > 0) {
      dispatch({ type: 'setLayers', payload: { value: [...initialLayers, ...hiddenMarineWarningLayers] } });
    }
  }, [initialLayers, dispatch]);

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
