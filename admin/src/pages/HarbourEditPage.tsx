import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { FairwayCardOrHarbor, HarborInput, Operation, Status } from '../graphql/generated';
import { useCurrentUserQueryData, useHarbourByIdQueryData } from '../graphql/api';
import HarbourForm from '../components/HarbourForm';
import { IonProgressBar } from '@ionic/react';
import { mapToHarborInput } from '../utils/dataMapper';

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

  const emptyHarbourInput: HarborInput = {
    geometry: { lat: '', lon: '' },
    id: '',
    version: 'v1',
    n2000HeightSystem: false,
    name: { fi: '', sv: '', en: '' },
    extraInfo: { fi: '', sv: '', en: '' },
    cargo: { fi: '', sv: '', en: '' },
    harborBasin: { fi: '', sv: '', en: '' },
    company: { fi: '', sv: '', en: '' },
    email: '',
    fax: '',
    internet: '',
    phoneNumber: [],
    quays: [],
    status: Status.Draft,
    operation: Operation.Create,
  };

  return (
    <>
      {harbourId && <HarbourEditForm harbourId={harbourId} harbourVersion={version} />}
      {locationState?.origin && <HarbourEditForm harbourId={locationState.origin.id} harbourVersion={locationState.origin.version} origin />}
      {!harbourId && !locationState?.origin && (
        <HarbourForm harbour={emptyHarbourInput} modified={0} modifier={'-'} creator={data?.currentUser?.name} created={0} />
      )}
    </>
  );
};

export default HarbourEditPage;
