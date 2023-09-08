import React, { Dispatch, SetStateAction, useCallback, useEffect } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import MainContent from '../components/content/MainContent';
import { useDocumentTitle } from '../hooks/dvkDocumentTitle';
import { isMobile } from '../utils/common';
import MainContentWithModal from '../components/content/MainContentWithModal';
import { marineWarningLayers } from '../utils/constants';

interface ModalProps {
  setModalContent: Dispatch<SetStateAction<string>>;
  layers: string[];
  setLayers: Dispatch<SetStateAction<string[]>>;
}

const MarineWarningPage: React.FC<ModalProps> = ({ setModalContent, layers, setLayers }) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'common' });
  const title = t('documentTitle') + ' - ' + t('marine-warnings');
  const [, setDocumentTitle] = useDocumentTitle(title);

  const updateLayers = useCallback(() => {
    const updatedLayers = [...layers];
    marineWarningLayers.forEach((layerId) => {
      if (!layers.includes(layerId)) {
        updatedLayers.push(layerId);
      }
    });
    setLayers(updatedLayers);
  }, [layers, setLayers]);

  useEffect(() => {
    setDocumentTitle(title);
  }, [setDocumentTitle, title]);

  useEffect(() => {
    setModalContent('marineWarningList');
    updateLayers();
  }, [setModalContent, updateLayers]);

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
