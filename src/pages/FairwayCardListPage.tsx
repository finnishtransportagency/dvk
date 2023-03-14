import React, { Dispatch, SetStateAction, useEffect } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import MainContent from '../components/content/MainContent';
import { useDocumentTitle } from '../hooks/dvkDocumentTitle';
import { isMobile } from '../utils/common';
import MainContentWithModal from '../components/content/MainContentWithModal';

interface ModalProps {
  setModalContent: Dispatch<SetStateAction<string>>;
}

const FairwayCardListPage: React.FC<ModalProps> = ({ setModalContent }) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'common' });
  const title = t('documentTitle') + ' - ' + t('fairway-cards');
  const [, setDocumentTitle] = useDocumentTitle(title);

  useEffect(() => {
    setDocumentTitle(title);
  }, [setDocumentTitle, title]);

  useEffect(() => {
    setModalContent('fairwayCardList');
  }, [setModalContent]);

  return (
    <IonPage id="mainContent" data-testid="fairwayList">
      <IonContent>
        {isMobile() && <MainContentWithModal />}
        {!isMobile() && <MainContent splitPane />}
      </IonContent>
    </IonPage>
  );
};

export default FairwayCardListPage;
