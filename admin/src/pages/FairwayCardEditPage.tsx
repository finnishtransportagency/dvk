import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { FairwayCardOrHarbor, Operation, Status } from '../graphql/generated';
import { useCurrentUserQueryData, useFairwayCardByIdQueryData } from '../graphql/api';
import FairwayCardForm from '../components/FairwayCardForm';
import { IonProgressBar } from '@ionic/react';
import { mapToFairwayCardInput } from '../utils/dataMapper';

interface FairwayCardEditProps {
  fairwayCardId: string;
  origin?: boolean;
}

const FairwayCardEditForm: React.FC<FairwayCardEditProps> = ({ fairwayCardId, origin }) => {
  const { data, isLoading, isError } = useFairwayCardByIdQueryData(fairwayCardId, false);
  const { data: userData } = useCurrentUserQueryData();

  const fairwayCard = mapToFairwayCardInput(origin, data);

  return (
    <>
      {isLoading && <IonProgressBar type="indeterminate" />}
      {!isLoading && (
        <FairwayCardForm
          fairwayCard={fairwayCard}
          modified={origin ? 0 : data?.fairwayCard?.modificationTimestamp ?? data?.fairwayCard?.creationTimestamp ?? 0}
          modifier={(origin ? userData?.currentUser?.name : data?.fairwayCard?.modifier ?? data?.fairwayCard?.creator) ?? ''}
          isError={isError}
        />
      )}
    </>
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
    additionalInfo: { fi: '', sv: '', en: '' },
    lineText: { fi: '', sv: '', en: '' },
    designSpeed: { fi: '', sv: '', en: '' },
    speedLimit: { fi: '', sv: '', en: '' },
    anchorage: { fi: '', sv: '', en: '' },
    navigationCondition: { fi: '', sv: '', en: '' },
    iceCondition: { fi: '', sv: '', en: '' },
    windRecommendation: { fi: '', sv: '', en: '' },
    vesselRecommendation: { fi: '', sv: '', en: '' },
    visibility: { fi: '', sv: '', en: '' },
    windGauge: { fi: '', sv: '', en: '' },
    seaLevel: { fi: '', sv: '', en: '' },
    trafficService: {
      pilot: {
        email: '',
        phoneNumber: '',
        fax: '',
        extraInfo: { fi: '', sv: '', en: '' },
        places: [],
      },
      vts: [],
      tugs: [],
    },
    status: Status.Draft,
    operation: Operation.Create,
    pictures: [],
  };

  return (
    <>
      {fairwayCardId && <FairwayCardEditForm fairwayCardId={fairwayCardId} />}
      {locationState?.origin && <FairwayCardEditForm fairwayCardId={locationState.origin.id} origin />}
      {!fairwayCardId && !locationState.origin && (
        <FairwayCardForm fairwayCard={emptyCardInput} modified={0} modifier={data?.currentUser?.name ?? ''} />
      )}
    </>
  );
};

export default FairwayCardEditPage;
