import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { useParams } from 'react-router-dom';
import { setSelectedFairwayCard, unsetSelectedFairwayCard } from '../components/layers';
import { useTranslation } from 'react-i18next';
import MainContent from '../components/content/MainContent';
import { useFairwayCardListData } from '../utils/dataLoader';
import {
  useArea12Layer,
  useArea3456Layer,
  useBoardLine12Layer,
  useCircleLayer,
  useDepth12Layer,
  useHarborLayer,
  useLine12Layer,
  useLine3456Layer,
  useSpecialArea15Layer,
  useSpecialArea2Layer,
} from '../components/FeatureLoader';
import { Lang } from '../utils/constants';
import { useDocumentTitle } from '../hooks/dvkDocumentTitle';
import { isMobile } from '../utils/common';
import MainContentWithModal from '../components/content/MainContentWithModal';
import { useDvkContext } from '../hooks/dvkContext';

interface FairwayCardPageProps {
  fairwayCardId?: string;
}

interface ModalProps {
  setModalContent: Dispatch<SetStateAction<string>>;
  preview: boolean;
}

const FairwayCardPage: React.FC<FairwayCardPageProps & ModalProps> = ({ setModalContent, preview }) => {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'common' });
  const lang = i18n.resolvedLanguage as Lang;
  const { fairwayCardId } = useParams<FairwayCardPageProps>();
  const { state, dispatch } = useDvkContext();

  //first component to load regarding single fairway card, so state is updateed here
  useEffect(() => {
    dispatch({
      type: 'setPreview',
      payload: {
        value: preview,
      },
    });
  }, [dispatch, preview]);

  const { data } = useFairwayCardListData();
  const line12Layer = useLine12Layer();
  const line3456Layer = useLine3456Layer();
  const area12Layer = useArea12Layer();
  const area3456Layer = useArea3456Layer();
  const depth12Layer = useDepth12Layer();
  const specialArea2Layer = useSpecialArea2Layer();
  const specialArea15Layer = useSpecialArea15Layer();
  const harborLayer = useHarborLayer();
  const boardLine12Layer = useBoardLine12Layer();
  const circleLayer = useCircleLayer();

  const [initDone, setInitDone] = useState(false);
  const [, setDocumentTitle] = useDocumentTitle(t('documentTitle'));

  useEffect(() => {
    if (
      line12Layer.ready &&
      line3456Layer.ready &&
      area12Layer.ready &&
      area3456Layer.ready &&
      depth12Layer.ready &&
      specialArea2Layer.ready &&
      specialArea15Layer.ready &&
      harborLayer.ready &&
      boardLine12Layer.ready &&
      circleLayer.ready
    ) {
      setInitDone(true);
    }
  }, [
    line12Layer.ready,
    line3456Layer.ready,
    area12Layer.ready,
    area3456Layer.ready,
    depth12Layer.ready,
    harborLayer.ready,
    boardLine12Layer.ready,
    circleLayer.ready,
    specialArea2Layer.ready,
    specialArea15Layer.ready,
  ]);

  useEffect(() => {
    if (data && fairwayCardId && initDone && !state.preview) {
      const filteredFairwayCard = data?.fairwayCards.filter((card: { id: string | undefined }) => card.id === fairwayCardId);
      const fairwayCard = filteredFairwayCard && filteredFairwayCard.length > 0 ? filteredFairwayCard[0] : undefined;
      if (fairwayCard) {
        setSelectedFairwayCard(fairwayCard);
        setDocumentTitle(t('documentTitle') + ' — ' + fairwayCard.name[lang] || fairwayCard.name.fi || '');
      }
    }
    return () => {
      unsetSelectedFairwayCard();
    };
  }, [fairwayCardId, data, initDone, t, lang, setDocumentTitle, state.preview]);

  useEffect(() => {
    setModalContent(fairwayCardId || 'fairwayCardList');
  }, [setModalContent, fairwayCardId]);

  return (
    <IonPage id="mainContent" data-testid="fairwayCard">
      <IonContent>
        {isMobile() && <MainContentWithModal />}
        {!isMobile() && <MainContent fairwayCardId={fairwayCardId} splitPane />}
      </IonContent>
    </IonPage>
  );
};

export default FairwayCardPage;
