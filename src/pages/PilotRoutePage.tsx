import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import MainContent from '../components/content/MainContent';
import { useDocumentTitle } from '../hooks/dvkDocumentTitle';
import { isMobile, updateLayerSelection } from '../utils/common';
import MainContentWithModal from '../components/content/MainContentWithModal';
import { useDvkContext } from '../hooks/dvkContext';

interface ModalProps {
  setModalContent: Dispatch<SetStateAction<string>>;
}

const layerId = 'pilotroute';

const PilotRoutePage: React.FC<ModalProps> = ({ setModalContent }) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'common' });
  const { state, dispatch } = useDvkContext();
  const title = t('documentTitle') + ' - ' + t('pilot-routes');
  const [, setDocumentTitle] = useDocumentTitle(title);
  const [initialLayers] = useState<string[]>(state.layers);

  useEffect(() => {
    setDocumentTitle(title);
  }, [setDocumentTitle, title]);

  useEffect(() => {
    setModalContent('pilotRouteList');
  }, [setModalContent]);

  useEffect(() => {
    updateLayerSelection(initialLayers, [layerId], dispatch);
  }, [dispatch, initialLayers]);

  return (
    <IonPage id="mainContent">
      <IonContent>
        {isMobile() && <MainContentWithModal />}
        {!isMobile() && <MainContent splitPane target="routes" />}
      </IonContent>
    </IonPage>
  );
};

export default PilotRoutePage;
