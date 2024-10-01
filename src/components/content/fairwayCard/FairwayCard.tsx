import React, { useEffect, useState } from 'react';
import { setFairwayCardByPreview } from '../../../utils/fairwayCardUtils';
import { useFairwayCardListData, useFairwayCardPreviewData } from '../../../utils/dataLoader';
import { useDvkContext } from '../../../hooks/dvkContext';
import dvkMap from '../../DvkMap';
import { FairwayCardContent } from './FairwayCardContent';

type FairwayCardProps = {
  id: string;
  widePane?: boolean;
};

const FairwayCard: React.FC<FairwayCardProps> = ({ id, widePane }) => {
  const [moveEnd, setMoveEnd] = useState(true);
  const [renderComplete, setRenderComplete] = useState(true);
  const [printDisabled, setPrintDisabled] = useState(true);
  const { state } = useDvkContext();

  const { data, isPending, dataUpdatedAt, isFetching } = useFairwayCardListData();
  const { data: previewData, isPending: previewPending, isFetching: previewFetching } = useFairwayCardPreviewData(id, state.preview, state.version);

  const fairwayCard = setFairwayCardByPreview(state.preview, id, data, previewData);
  //for disabling printing icon
  useEffect(() => {
    const handleMoveStart = () => {
      setMoveEnd(false);
      setRenderComplete(false);
    };
    const handleMoveEnd = () => {
      setMoveEnd(true);
    };
    const handleRenderComplete = () => {
      setRenderComplete(true);
    };

    dvkMap.olMap?.on('movestart', handleMoveStart);
    dvkMap.olMap?.on('moveend', handleMoveEnd);
    dvkMap.olMap?.on('rendercomplete', handleRenderComplete);

    setPrintDisabled(!(moveEnd && renderComplete));
    return () => {
      dvkMap.olMap?.un('movestart', handleMoveStart);
      dvkMap.olMap?.un('moveend', handleMoveEnd);
      dvkMap.olMap?.un('rendercomplete', handleRenderComplete);
    };
  }, [moveEnd, renderComplete]);

  return (
    <FairwayCardContent
      fairwayCardId={id}
      fairwayCard={fairwayCard}
      isPending={state.preview ? previewPending : isPending}
      dataUpdatedAt={dataUpdatedAt}
      isFetching={state.preview ? previewFetching : isFetching}
      printDisabled={printDisabled}
      widePane={widePane}
    />
  );
};

export default FairwayCard;
