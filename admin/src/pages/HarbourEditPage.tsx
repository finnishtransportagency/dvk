import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { FairwayCardOrHarbor } from '../graphql/generated';
import { useCurrentUserQueryData, useHarbourByIdQueryData } from '../graphql/api';
import HarbourForm from '../components/HarbourForm';
import { IonProgressBar } from '@ionic/react';
import { mapToHarborInput } from '../utils/dataMapper';
import { getEmptyHarborInput } from '../utils/common';

interface HarbourEditProps {
  harbourId: string;
  harbourVersion?: string;
  origin?: boolean;
}

const HarbourEditForm: React.FC<HarbourEditProps> = ({ harbourId, harbourVersion = 'v1', origin }) => {
  const { data, isLoading, isError } = useHarbourByIdQueryData(harbourId, harbourVersion, false);
  const { data: userData } = useCurrentUserQueryData();

  const harbour = mapToHarborInput(origin, data);

  return (
    <>
      {isLoading && <IonProgressBar type="indeterminate" />}
      {!isLoading && (
        <HarbourForm
          harbour={harbour}
          modified={origin ? 0 : (data?.harbor?.modificationTimestamp ?? data?.harbor?.creationTimestamp ?? 0)}
          modifier={(origin ? '-' : (data?.harbor?.modifier ?? data?.harbor?.creator)) ?? ''}
          creator={origin ? userData?.currentUser?.name : (data?.harbor?.creator ?? undefined)}
          created={origin ? 0 : (data?.harbor?.creationTimestamp ?? undefined)}
          isError={isError}
        />
      )}
    </>
  );
};

interface HarbourProps {
  harbourId?: string;
  version?: string;
}

type LocationState = {
  // harborInput when creating a new version since the whole harbor data is copied initially
  origin?: FairwayCardOrHarbor;
};

const HarbourEditPage: React.FC<HarbourProps> = () => {
  const { harbourId, version } = useParams<HarbourProps>();
  const location = useLocation();
  const locationState = location.state as LocationState;

  const { data } = useCurrentUserQueryData();

  return (
    <>
      {harbourId && <HarbourEditForm harbourId={harbourId} harbourVersion={version} />}
      {locationState?.origin && <HarbourEditForm harbourId={locationState.origin.id} harbourVersion={locationState.origin.version} origin />}
      {!harbourId && !locationState?.origin && (
        <HarbourForm
          harbour={getEmptyHarborInput(locationState.origin?.id ?? '')}
          modified={0}
          modifier={'-'}
          creator={data?.currentUser?.name}
          created={0}
        />
      )}
    </>
  );
};

export default HarbourEditPage;
