import { IonText, IonSegment, IonSegmentButton, IonLabel } from '@ionic/react';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useHarborPreviewData } from '../../utils/dataLoader';
import Breadcrumb from './Breadcrumb';
import { useDvkContext } from '../../hooks/dvkContext';
import { HarbourInfo } from './fairwayCard/HarbourInfo';
import { InfoParagraph } from './Paragraph';
import { getTabLabel } from '../../utils/fairwayCardUtils';
import PendingPlaceholder from './fairwayCard/PendingPlaceholder';
import { FairwayCardHeader } from './fairwayCard/FairwayCardHeader';
import { setSelectedHarborPreview, unsetSelectedHarborPreview } from '../layers';
import { useHarborLayer } from '../FeatureLoader';

interface HarborPreviewProps {
  widePane?: boolean;
}

const HarborPreview: React.FC<HarborPreviewProps> = ({ widePane }) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });
  const { state } = useDvkContext();
  const { data, isPending, isFetching } = useHarborPreviewData(state.harborId);
  const { ready: layerReady } = useHarborLayer();

  const path = [{ title: t('title', { count: 0 }), route: '/kortit/' }, { title: '-' }, { title: t('harboursTitle') }];

  useEffect(() => {
    if (data?.harborPreview && layerReady) {
      setSelectedHarborPreview(data.harborPreview);
    }
    return () => {
      unsetSelectedHarborPreview();
    };
  }, [data?.harborPreview, layerReady]);

  return (
    <>
      {isPending ? (
        <PendingPlaceholder widePane={widePane} />
      ) : (
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

          <IonSegment className="tabs" value={2}>
            {[1, 2, 3].map((tabId) => (
              <IonSegmentButton key={tabId} value={tabId} disabled={tabId !== 2}>
                <IonLabel>
                  <h3>{getTabLabel(t, tabId)}</h3>
                </IonLabel>
              </IonSegmentButton>
            ))}
          </IonSegment>

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
