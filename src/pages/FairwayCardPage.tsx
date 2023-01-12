import React, { useEffect, useState } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { useParams } from 'react-router-dom';
import { setSelectedFairwayCard, unsetSelectedFairwayCard } from '../components/layers';
import { useTranslation } from 'react-i18next';
import MainContent from '../components/content/MainContent';
import { useFairwayCardListData } from '../utils/dataLoader';
import {
  useArea12Layer,
  useArea3456Layer,
  useDepth12Layer,
  useHarborLayer,
  useLine12Layer,
  useLine3456Layer,
  useSpecialAreaLayer,
} from '../components/FeatureLoader';
import { Lang } from '../utils/constants';

interface FairwayCardPageProps {
  fairwayCardId?: string;
}

const FairwayCardPage: React.FC<FairwayCardPageProps> = () => {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'common' });
  const lang = i18n.resolvedLanguage as Lang;
  const { fairwayCardId } = useParams<FairwayCardPageProps>();

  const { data } = useFairwayCardListData();
  const line12Layer = useLine12Layer();
  const line3456Layer = useLine3456Layer();
  const area12Layer = useArea12Layer();
  const area3456Layer = useArea3456Layer();
  const depth12Layer = useDepth12Layer();
  const specialAreaLayer = useSpecialAreaLayer();
  const harborLayer = useHarborLayer();

  const [initDone, setInitDone] = useState(false);

  useEffect(() => {
    if (line12Layer && line3456Layer && area12Layer && area3456Layer && depth12Layer && specialAreaLayer && harborLayer) {
      setInitDone(true);
    }
  }, [line12Layer, line3456Layer, area12Layer, area3456Layer, depth12Layer, specialAreaLayer, harborLayer]);

  useEffect(() => {
    if (data && fairwayCardId && initDone) {
      const filteredFairwayCard = data?.fairwayCards.filter((card: { id: string | undefined }) => card.id === fairwayCardId);
      const fairwayCard = filteredFairwayCard && filteredFairwayCard.length > 0 ? filteredFairwayCard[0] : undefined;
      if (fairwayCard) {
        setSelectedFairwayCard(fairwayCard);
        document.title = t('documentTitle') + ' — ' + fairwayCard.name[lang] || fairwayCard.name.fi || '';
      }
    }
    return () => {
      unsetSelectedFairwayCard();
    };
  }, [fairwayCardId, data, initDone, t, lang]);

  return (
    <IonPage id="mainContent" data-testid="fairwayCard">
      <IonContent>
        <MainContent fairwayCardId={fairwayCardId} splitPane />
      </IonContent>
    </IonPage>
  );
};

export default FairwayCardPage;
