import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { FairwayCardOrHarbor } from '../graphql/generated';
import { useCurrentUserQueryData, useFairwayCardByIdQueryData } from '../graphql/api';
import FairwayCardForm from '../components/FairwayCardForm';
import { IonProgressBar } from '@ionic/react';
import { mapToFairwayCardInput } from '../utils/dataMapper';
import { getEmptyFairwayCardInput } from '../utils/common';

interface FairwayCardEditProps {
  fairwayCardId: string;
  fairwayCardVersion?: string;
  sourceCardId?: string;
  sourceCardVersion?: string;
  copyPictures?: boolean;
}

const FairwayCardEditForm: React.FC<FairwayCardEditProps> = ({
  fairwayCardId,
  fairwayCardVersion = 'v1',
  sourceCardId,
  sourceCardVersion,
  copyPictures,
}) => {
  const { data, isLoading, isError } = useFairwayCardByIdQueryData(fairwayCardId, fairwayCardVersion, false);
  const { data: userData } = useCurrentUserQueryData();

  const fairwayCard = mapToFairwayCardInput(sourceCardId, data, copyPictures);

  return (
    <>
      {isLoading && <IonProgressBar type="indeterminate" />}
      {!isLoading && (
        <FairwayCardForm
          fairwayCard={{ ...fairwayCard }}
          modified={sourceCardId ? 0 : (data?.fairwayCard?.modificationTimestamp ?? data?.fairwayCard?.creationTimestamp ?? 0)}
          modifier={sourceCardId ? '-' : (data?.fairwayCard?.modifier ?? data?.fairwayCard?.creator ?? '')}
          creator={sourceCardId ? userData?.currentUser?.name : (data?.fairwayCard?.creator ?? undefined)}
          created={sourceCardId ? 0 : (data?.fairwayCard?.creationTimestamp ?? undefined)}
          sourceCardId={sourceCardId}
          sourceCardVersion={sourceCardVersion}
          isError={isError}
        />
      )}
    </>
  );
};

interface FairwayCardProps {
  fairwayCardId?: string;
  version?: string;
}

type LocationState = {
  //fairwayCardInput when creating a new version since the whole card data is copied initially
  origin?: FairwayCardOrHarbor;
  copyPictures?: boolean;
  newVersion?: boolean;
};

const FairwayCardEditPage: React.FC<FairwayCardProps> = () => {
  // when fairwayCardId is undefined, we're creating new entry
  const { fairwayCardId, version } = useParams<FairwayCardProps>();
  const location = useLocation();
  const locationState = location.state as LocationState;

  const { data } = useCurrentUserQueryData();
  const emptyCardInput = getEmptyFairwayCardInput(locationState.origin?.id);

  return (
    <>
      {fairwayCardId && <FairwayCardEditForm fairwayCardId={fairwayCardId} fairwayCardVersion={version} />}
      {locationState?.origin && (
        <FairwayCardEditForm
          fairwayCardId={locationState.origin.id}
          fairwayCardVersion={locationState.origin.version}
          sourceCardId={locationState.origin.id}
          sourceCardVersion={locationState.origin.version}
          copyPictures={locationState?.copyPictures}
        />
      )}
      {!fairwayCardId && !locationState?.origin && (
        <FairwayCardForm fairwayCard={emptyCardInput} modified={0} modifier="-" creator={data?.currentUser?.name} created={0} />
      )}
    </>
  );
};

export default FairwayCardEditPage;
