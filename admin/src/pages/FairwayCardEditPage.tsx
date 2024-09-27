import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { FairwayCardOrHarbor, Operation, Status } from '../graphql/generated';
import { useCurrentUserQueryData, useFairwayCardByIdQueryData } from '../graphql/api';
import FairwayCardForm from '../components/FairwayCardForm';
import { IonProgressBar } from '@ionic/react';
import { mapToFairwayCardInput } from '../utils/dataMapper';

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
          fairwayCard={fairwayCard}
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
}

type LocationState = {
  origin?: FairwayCardOrHarbor;
  copyPictures?: boolean;
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
    // for now version is v1 since versioning is not still used so it always defaults to 'v1'
    version: 'v1',
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
    pilotRoutes: [],
    temporaryNotifications: [],
  };

  return (
    <>
      {fairwayCardId && <FairwayCardEditForm fairwayCardId={fairwayCardId} />}
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
