import React, { Dispatch, SetStateAction, useEffect } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import MainContent from '../components/content/MainContent';
import { useDocumentTitle } from '../hooks/dvkDocumentTitle';
import { isMobile } from '../utils/common';
import MainContentWithModal from '../components/content/MainContentWithModal';
import { useParams } from 'react-router-dom';

interface ModalProps {
  setModalContent: Dispatch<SetStateAction<string>>;
}

const HarborPreviewPage: React.FC<ModalProps> = ({ setModalContent }) => {
  const { t } = useTranslation();
  const { harborId } = useParams();
  const title = t('common.documentTitle') + ' - ' + t('fairwayCards.harboursTitle');
  const [, setDocumentTitle] = useDocumentTitle(title);

  useEffect(() => {
    setDocumentTitle(title);
  }, [setDocumentTitle, title]);

  useEffect(() => {
    setModalContent('harborPreview');
  }, [setModalContent]);

  return (
    <IonPage id="mainContent">
      <IonContent>
        {isMobile() && <MainContentWithModal />}
        {!isMobile() && <MainContent target="harborPreview" harborId={harborId} splitPane />}
      </IonContent>
    </IonPage>
  );
};

export default HarborPreviewPage;
