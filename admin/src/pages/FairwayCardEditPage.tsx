import React from 'react';
import { useParams } from 'react-router-dom';
import { useFairwayCardByIdQueryData } from '../graphql/api';
import FairwayCardForm from '../components/FairwayCardForm';
import { IonProgressBar } from '@ionic/react';
import { mapToFairwayCardInput } from '../utils/dataMapper';
import { isObjectUntouched } from '../utils/common';

interface FairwayCardProps {
  fairwayCardId?: string;
  fairwayCardVersion?: string;
}

const FairwayCardEditPage: React.FC = () => {
  const { fairwayCardId, fairwayCardVersion } = useParams<FairwayCardProps>();
  const { data, isLoading, isError } = useFairwayCardByIdQueryData(fairwayCardId ?? '', fairwayCardVersion, false);

  const fairwayCard = mapToFairwayCardInput(undefined, data);
  console.log(data?.fairwayCard?.creationTimestamp, data?.fairwayCard?.modificationTimestamp, data?.fairwayCard?.version);

  return (
    <>
      {isLoading && <IonProgressBar type="indeterminate" aria-hidden="true" />}
      {!isLoading && (
        <FairwayCardForm
          fairwayCard={{ ...fairwayCard }}
          modified={data?.fairwayCard?.modificationTimestamp ?? data?.fairwayCard?.creationTimestamp ?? 0}
          modifier={data?.fairwayCard?.modifier ?? data?.fairwayCard?.creator ?? ''}
          creator={data?.fairwayCard?.creator ?? undefined}
          created={data?.fairwayCard?.creationTimestamp ?? undefined}
          isError={isError}
          newElement={isObjectUntouched(data?.fairwayCard)}
        />
      )}
    </>
  );
};

export default FairwayCardEditPage;
