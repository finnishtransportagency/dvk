import React from 'react';
import { useParams } from 'react-router-dom';
import { useHarbourByIdQueryData } from '../graphql/api';
import HarbourForm from '../components/HarbourForm';
import { IonProgressBar } from '@ionic/react';
import { mapToHarborInput } from '../utils/dataMapper';

interface HarbourProps {
  harbourId?: string;
  harbourVersion?: string;
}

const HarbourEditPage: React.FC = () => {
  const { harbourId, harbourVersion } = useParams<HarbourProps>();
  const { data, isLoading, isError } = useHarbourByIdQueryData(harbourId ?? '', harbourVersion, false);

  const harbour = mapToHarborInput(false, data);

  return (
    <>
      {isLoading && <IonProgressBar type="indeterminate" />}
      {!isLoading && (
        <HarbourForm
          harbour={harbour}
          modified={data?.harbor?.modificationTimestamp ?? data?.harbor?.creationTimestamp ?? 0}
          modifier={data?.harbor?.modifier ?? data?.harbor?.creator ?? ''}
          creator={data?.harbor?.creator ?? undefined}
          created={data?.harbor?.creationTimestamp ?? undefined}
          isError={isError}
        />
      )}
    </>
  );
};

export default HarbourEditPage;
