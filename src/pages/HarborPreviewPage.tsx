import React, { Dispatch, SetStateAction, useEffect } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import MainContent from '../components/content/MainContent';
import { useDocumentTitle } from '../hooks/dvkDocumentTitle';
import { isMobile } from '../utils/common';
import MainContentWithModal from '../components/content/MainContentWithModal';
import { useParams } from 'react-router-dom';
import { useDvkContext } from '../hooks/dvkContext';

interface ModalProps {
  setModalContent: Dispatch<SetStateAction<string>>;
}

type HarborPreviewParams = {
  harborId: string;
  version: string;
};

const HarborPreviewPage: React.FC<ModalProps> = ({ setModalContent }) => {
  const { t } = useTranslation();
  const { harborId, version } = useParams<HarborPreviewParams>();
  const { dispatch } = useDvkContext();
  const title = t('common.documentTitle') + ' - ' + t('fairwayCards.harboursTitle');
  const [, setDocumentTitle] = useDocumentTitle(title);

  useEffect(() => {
    setDocumentTitle(title);
  }, [setDocumentTitle, title]);

  useEffect(() => {
    setModalContent('harborPreview');
  }, [setModalContent]);

  useEffect(() => {
    dispatch({
      type: 'setHarborId',
      payload: {
        value: harborId,
      },
    });
    dispatch({
      type: 'version',
      payload: {
        value: version,
      },
    });
  }, [dispatch, harborId, version]);

  return (
    <IonPage id="mainContent">
      <IonContent>
        {isMobile() && <MainContentWithModal />}
        {!isMobile() && <MainContent target="harborPreview" splitPane />}
      </IonContent>
    </IonPage>
  );
};

export default HarborPreviewPage;
