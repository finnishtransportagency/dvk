import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { FairwayCardOrHarbor, HarborInput, Operation, Status } from '../graphql/generated';
import { useCurrentUserQueryData, useHarbourByIdQueryData } from '../graphql/api';
import HarbourForm from '../components/HarbourForm';
import { IonProgressBar } from '@ionic/react';

interface HarbourEditProps {
  harbourId: string;
  origin?: boolean;
}

const HarbourEditForm: React.FC<HarbourEditProps> = ({ harbourId, origin }) => {
  const { data, isLoading, isError } = useHarbourByIdQueryData(harbourId, false);
  const { data: userData } = useCurrentUserQueryData();

  const coordinates = data?.harbor?.geometry?.coordinates || [0, 0];

  const harbour = {
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
    quays: data?.harbor?.quays?.map((quay) => {
      const quayCoords = quay?.geometry?.coordinates || [0, 0];
      return {
        extraInfo: {
          fi: quay?.extraInfo?.fi || '',
          sv: quay?.extraInfo?.sv || '',
          en: quay?.extraInfo?.en || '',
        },
        geometry: { lat: quayCoords[1] || 0, lon: quayCoords[0] || 0 },
        length: quay?.length,
        name: { fi: quay?.name?.fi || '', sv: quay?.name?.sv || '', en: quay?.name?.en || '' },
        sections: quay?.sections?.map((section) => {
          const sectionCoords = section?.geometry?.coordinates || [0, 0];
          return { depth: section?.depth || 0, geometry: { lat: sectionCoords[1] || 0, lon: sectionCoords[0] || 0 }, name: section?.name };
        }),
      };
    }),
    status: origin ? Status.Draft : data?.harbor?.status || Status.Draft,
    operation: origin ? Operation.Create : Operation.Update,
  };

  return (
    <>
      {isLoading && <IonProgressBar type="indeterminate" />}
      {!isLoading && (
        <HarbourForm
          harbour={harbour}
          modified={origin ? 0 : data?.harbor?.modificationTimestamp || data?.harbor?.creationTimestamp || 0}
          modifier={(origin ? userData?.currentUser?.name : data?.harbor?.modifier || data?.harbor?.creator) || ''}
          isError={isError}
        />
      )}
    </>
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
      {harbourId && <HarbourEditForm harbourId={harbourId} />}
      {locationState && locationState.origin && <HarbourEditForm harbourId={locationState.origin.id} origin />}
      {!harbourId && !locationState.origin && <HarbourForm harbour={emptyHarbourInput} modified={0} modifier={data?.currentUser?.name || ''} />}
    </>
  );
};

export default HarbourEditPage;
