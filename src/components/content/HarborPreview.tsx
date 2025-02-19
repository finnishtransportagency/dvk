import { IonText } from '@ionic/react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHarborPreviewData } from '../../utils/dataLoader';
import Breadcrumb from './Breadcrumb';
import { useDvkContext } from '../../hooks/dvkContext';
import { HarbourInfo } from './fairwayCard/HarbourInfo';
import { InfoParagraph } from './Paragraph';
import PendingPlaceholder from './fairwayCard/PendingPlaceholder';
import { FairwayCardHeader } from './fairwayCard/FairwayCardHeader';
import { setSelectedHarborPreview, unsetSelectedHarborPreview } from '../layers';
import { HarborPreviewAlert } from './HarborPreviewAlert';
import { TabSwiper } from './fairwayCard/TabSwiper';
import { useHarborLayer } from '../HarborFeatureLoader';
import { useQuayLayer } from '../QuayFeatureLoader';

interface HarborPreviewProps {
  widePane?: boolean;
}

const HarborPreview: React.FC<HarborPreviewProps> = ({ widePane }) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });
  const { state } = useDvkContext();
  const [tab, setTab] = useState(2);
  const { data, isPending, isFetching } = useHarborPreviewData(state.harborId, state.version);
  const { ready: layerReady } = useHarborLayer();
  const { ready: quayLayerReady } = useQuayLayer();

  const path = [{ title: t('title', { count: 0 }), route: '/kortit/' }, { title: '-' }, { title: t('harboursTitle') }];
  useEffect(() => {
    if (data?.harborPreview && layerReady && quayLayerReady) {
      setSelectedHarborPreview(data.harborPreview);
    }
    return () => {
      unsetSelectedHarborPreview();
    };
  }, [data?.harborPreview, layerReady, quayLayerReady]);

  return (
    <>
      {isPending && <PendingPlaceholder widePane={widePane} />}
      {!isPending && !data?.harborPreview && <HarborPreviewAlert harborId={state.harborId} />}
      {!isPending && data?.harborPreview && (
        <>
          <Breadcrumb path={path} />
          <FairwayCardHeader
            fairwayTitle="-"
            infoText1={t('harborPreview')}
            infoText2="-"
            isPending={isPending}
            isFetching={isFetching}
            printDisabled
          />

          <TabSwiper tab={tab} setTab={setTab} widePane={widePane} disabled />

          <div className={'tabContent tab2 active' + (widePane ? ' wide' : '')}>
            {data?.harborPreview ? (
              <HarbourInfo data={data.harborPreview} isLast />
            ) : (
              <IonText>
                <InfoParagraph />
              </IonText>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default HarborPreview;
