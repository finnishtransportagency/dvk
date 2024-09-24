import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { useParams } from 'react-router-dom';
import { setSelectedFairwayCard, unsetSelectedFairwayCard } from '../components/layers';
import { useTranslation } from 'react-i18next';
import MainContent from '../components/content/MainContent';
import { useFairwayCardListData, useFairwayCardPreviewData } from '../utils/dataLoader';
import {
  useArea12Layer,
  useArea3456Layer,
  useBoardLine12Layer,
  useCircleLayer,
  useDepth12Layer,
  useLine12Layer,
  useLine3456Layer,
  useSpecialArea15Layer,
  useSpecialArea2Layer,
} from '../components/FeatureLoader';
import { Lang } from '../utils/constants';
import { useDocumentTitle } from '../hooks/dvkDocumentTitle';
import { isMobile } from '../utils/common';
import { setFairwayCardByPreview } from '../utils/fairwayCardUtils';
import MainContentWithModal from '../components/content/MainContentWithModal';
import { useDvkContext } from '../hooks/dvkContext';
import { FairwayCardPartsFragment } from '../graphql/generated';
import { useSafetyEquipmentAndFaultLayer } from '../components/SafetyEquipmentFeatureLoader';
import { useHarborLayer } from '../components/HarborFeatureLoader';

interface ModalProps {
  setModalContent: Dispatch<SetStateAction<string>>;
}

type FairwayCardParams = {
  fairwayCardId?: string;
};

const FairwayCardPage: React.FC<ModalProps> = ({ setModalContent }) => {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'common' });
  const lang = i18n.resolvedLanguage as Lang;
  const { fairwayCardId } = useParams<FairwayCardParams>();
  const { state } = useDvkContext();

  const { data, isPending } = useFairwayCardListData();
  const { data: previewData, isPending: previewPending } = useFairwayCardPreviewData(fairwayCardId!, state.preview);
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
  const safetyEquipmentFaultLayer = useSafetyEquipmentAndFaultLayer();

  const [initDone, setInitDone] = useState(false);
  const [, setDocumentTitle] = useDocumentTitle(t('documentTitle'));
  const [fairwayCard, setFairwayCard] = useState<FairwayCardPartsFragment | undefined>(undefined);

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
      circleLayer.ready &&
      safetyEquipmentFaultLayer.ready
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
    safetyEquipmentFaultLayer.ready,
  ]);

  useEffect(() => {
    const dataReady = state.preview ? !previewPending : !isPending && data;
    if (fairwayCardId && dataReady) {
      const card = setFairwayCardByPreview(state.preview, fairwayCardId, data, previewData);
      if (card) {
        setFairwayCard(card);
      }
    }
  }, [fairwayCardId, isPending, previewPending, data, previewData, state.preview]);

  useEffect(() => {
    if (fairwayCard && initDone) {
      setSelectedFairwayCard(fairwayCard);
    }
    return () => {
      unsetSelectedFairwayCard();
    };
  }, [fairwayCard, initDone]);

  useEffect(() => {
    if (fairwayCard) {
      setDocumentTitle((t('documentTitle') + ' — ' + fairwayCard.name[lang] || fairwayCard.name.fi) ?? '');
    }
  }, [fairwayCard, t, lang, setDocumentTitle]);

  useEffect(() => {
    setModalContent(fairwayCardId ?? 'fairwayCardList');
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
