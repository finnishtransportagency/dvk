import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { FairwayCardOrHarbor, HarborInput, Operation, Status } from '../graphql/generated';
import { useCurrentUserQueryData, useHarbourByIdQueryData } from '../graphql/api';
import HarbourForm from '../components/HarbourForm';

interface HarbourEditProps {
  harbourId: string;
  origin?: boolean;
}

const HarbourEditForm: React.FC<HarbourEditProps> = ({ harbourId, origin }) => {
  const { data, isLoading, isFetching, isError } = useHarbourByIdQueryData(harbourId, false);
  const { data: userData } = useCurrentUserQueryData();

  const coordinates = data?.harbor?.geometry?.coordinates || [0, 0];

  const harbour: HarborInput = {
    id: origin ? '' : data?.harbor?.id || '',
    name: {
      fi: data?.harbor?.name?.fi || '',
      sv: data?.harbor?.name?.sv || '',
      en: data?.harbor?.name?.en || '',
    },
    extraInfo: {
      fi: data?.harbor?.extraInfo?.fi || '',
      sv: data?.harbor?.extraInfo?.sv || '',
      en: data?.harbor?.extraInfo?.en || '',
    },
    cargo: {
      fi: data?.harbor?.cargo?.fi || '',
      sv: data?.harbor?.cargo?.sv || '',
      en: data?.harbor?.cargo?.en || '',
    },
    harborBasin: {
      fi: data?.harbor?.harborBasin?.fi || '',
      sv: data?.harbor?.harborBasin?.sv || '',
      en: data?.harbor?.harborBasin?.en || '',
    },
    n2000HeightSystem: data?.harbor?.n2000HeightSystem || false,
    geometry: { lat: coordinates[1] || 0, lon: coordinates[0] || 0 },
    company: {
      fi: data?.harbor?.company?.fi || '',
      sv: data?.harbor?.company?.sv || '',
      en: data?.harbor?.company?.en || '',
    },
    email: data?.harbor?.email || '',
    fax: data?.harbor?.fax || '',
    internet: data?.harbor?.internet || '',
    phoneNumber: data?.harbor?.phoneNumber || [],
    status: origin ? Status.Draft : data?.harbor?.status || Status.Draft,
    operation: origin ? Operation.Create : Operation.Update,
  };

  return (
    <HarbourForm
      harbour={harbour}
      isLoading={isLoading || isFetching}
      modified={origin ? 0 : data?.harbor?.modificationTimestamp || data?.harbor?.creationTimestamp || 0}
      modifier={(origin ? userData?.currentUser?.name : data?.harbor?.modifier || data?.harbor?.creator) || ''}
      isError={isError}
    />
  );
};

interface HarbourProps {
  harbourId?: string;
}

type LocationState = {
  origin?: FairwayCardOrHarbor;
};

const HarbourEditPage: React.FC<HarbourProps> = () => {
  const { harbourId } = useParams<HarbourProps>();
  const location = useLocation();
  const locationState = location.state as LocationState;

  const { data } = useCurrentUserQueryData();

  const emptyHarbourInput: HarborInput = {
    geometry: { lat: 0, lon: 0 },
    id: '',
    n2000HeightSystem: false,
    name: { fi: '', sv: '', en: '' },
    extraInfo: { fi: '', sv: '', en: '' },
    cargo: { fi: '', sv: '', en: '' },
    harborBasin: { fi: '', sv: '', en: '' },
    status: Status.Draft,
    operation: Operation.Create,
  };

  return (
    <>
      {harbourId && <HarbourEditForm harbourId={harbourId} />}
      {locationState && locationState.origin && <HarbourEditForm harbourId={locationState.origin.id} origin />}
      {!harbourId && !locationState.origin && <HarbourForm harbour={emptyHarbourInput} modified={0} modifier={data?.currentUser?.name || ''} />}
    </>
  );
};

export default HarbourEditPage;
