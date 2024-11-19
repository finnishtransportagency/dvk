import React from 'react';
import { useParams } from 'react-router-dom';
import { useFairwayCardByIdQueryData } from '../graphql/api';
import FairwayCardForm from '../components/FairwayCardForm';
import { IonProgressBar } from '@ionic/react';
import { mapToFairwayCardInput } from '../utils/dataMapper';

interface FairwayCardProps {
  fairwayCardId?: string;
  fairwayCardVersion?: string;
}

const FairwayCardEditPage: React.FC = () => {
  const { fairwayCardId, fairwayCardVersion } = useParams<FairwayCardProps>();
  const { data, isLoading, isError } = useFairwayCardByIdQueryData(fairwayCardId ?? '', fairwayCardVersion, false);

  const fairwayCard = mapToFairwayCardInput(undefined, data);

  return (
    <>
      {isLoading && <IonProgressBar type="indeterminate" />}
      {!isLoading && (
        <FairwayCardForm
          fairwayCard={{ ...fairwayCard }}
          modified={data?.fairwayCard?.modificationTimestamp ?? data?.fairwayCard?.creationTimestamp ?? 0}
          modifier={data?.fairwayCard?.modifier ?? data?.fairwayCard?.creator ?? ''}
          creator={data?.fairwayCard?.creator ?? undefined}
          created={data?.fairwayCard?.creationTimestamp ?? undefined}
          isError={isError}
        />
      )}
    </>
  );
};

export default FairwayCardEditPage;
