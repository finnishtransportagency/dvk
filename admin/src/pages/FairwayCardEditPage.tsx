import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { FairwayCardOrHarbor, Operation, Status } from '../graphql/generated';
import { useCurrentUserQueryData, useFairwayCardByIdQueryData } from '../graphql/api';
import FairwayCardForm from '../components/FairwayCardForm';

interface FairwayCardEditProps {
  fairwayCardId: string;
  origin?: boolean;
}

const FairwayCardEditForm: React.FC<FairwayCardEditProps> = ({ fairwayCardId, origin }) => {
  const { data, isLoading, isFetching, isError } = useFairwayCardByIdQueryData(fairwayCardId, false);
  const { data: userData } = useCurrentUserQueryData();

  const fairwayCard = {
    anchorage: {
      fi: data?.fairwayCard?.anchorage?.fi || '',
      sv: data?.fairwayCard?.anchorage?.sv || '',
      en: data?.fairwayCard?.anchorage?.en || '',
    },
    id: origin ? '' : data?.fairwayCard?.id || '',
    group: data?.fairwayCard?.group || '',
    name: {
      fi: data?.fairwayCard?.name?.fi || '',
      sv: data?.fairwayCard?.name?.sv || '',
      en: data?.fairwayCard?.name?.en || '',
    },
    n2000HeightSystem: data?.fairwayCard?.n2000HeightSystem || false,
    status: origin ? Status.Draft : data?.fairwayCard?.status || Status.Draft,
    fairwayIds: data?.fairwayCard?.fairways.flatMap((fairway) => fairway.id) || [],
    harbors: data?.fairwayCard?.harbors?.flatMap((harbor) => harbor.id) || [],
    primaryFairwayId: data?.fairwayCard?.fairways.find((fairway) => fairway.primary)?.id || 0,
    secondaryFairwayId: data?.fairwayCard?.fairways.find((fairway) => fairway.secondary)?.id || 0,
    lineText: {
      fi: data?.fairwayCard?.lineText?.fi || '',
      sv: data?.fairwayCard?.lineText?.sv || '',
      en: data?.fairwayCard?.lineText?.en || '',
    },
    operation: origin ? Operation.Create : Operation.Update,
  };

  return (
    <FairwayCardForm
      fairwayCard={fairwayCard}
      isLoading={isLoading || isFetching}
      modified={origin ? 0 : data?.fairwayCard?.modificationTimestamp || data?.fairwayCard?.creationTimestamp || 0}
      modifier={(origin ? userData?.currentUser?.name : data?.fairwayCard?.modifier || data?.fairwayCard?.creator) || ''}
      isError={isError}
    />
  );
};

interface FairwayCardProps {
  fairwayCardId?: string;
}

type LocationState = {
  origin?: FairwayCardOrHarbor;
};

const FairwayCardEditPage: React.FC<FairwayCardProps> = () => {
  const { fairwayCardId } = useParams<FairwayCardProps>();
  const location = useLocation();
  const locationState = location.state as LocationState;

  const { data } = useCurrentUserQueryData();

  const emptyCardInput = {
    fairwayIds: [],
    group: '',
    harbors: [],
    id: '',
    n2000HeightSystem: false,
    name: { fi: '', sv: '', en: '' },
    lineText: { fi: '', sv: '', en: '' },
    status: Status.Draft,
    operation: Operation.Create,
  };

  return (
    <>
      {fairwayCardId && <FairwayCardEditForm fairwayCardId={fairwayCardId} />}
      {locationState && locationState.origin && <FairwayCardEditForm fairwayCardId={locationState.origin.id} origin />}
      {!fairwayCardId && !locationState.origin && (
        <FairwayCardForm fairwayCard={emptyCardInput} modified={0} modifier={data?.currentUser?.name || ''} />
      )}
    </>
  );
};

export default FairwayCardEditPage;
