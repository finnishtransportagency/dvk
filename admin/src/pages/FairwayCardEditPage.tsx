import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { FairwayCardOrHarbor, Operation, Status } from '../graphql/generated';
import { useCurrentUserQueryData, useFairwayCardByIdQueryData } from '../graphql/api';
import FairwayCardForm from '../components/FairwayCardForm';
import { IonProgressBar } from '@ionic/react';

interface FairwayCardEditProps {
  fairwayCardId: string;
  origin?: boolean;
}

const FairwayCardEditForm: React.FC<FairwayCardEditProps> = ({ fairwayCardId, origin }) => {
  const { data, isLoading, isError } = useFairwayCardByIdQueryData(fairwayCardId, false);
  const { data: userData } = useCurrentUserQueryData();

  const fairwayCard = {
    id: origin ? '' : data?.fairwayCard?.id ?? '',
    group: data?.fairwayCard?.group ?? '',
    name: {
      fi: data?.fairwayCard?.name?.fi ?? '',
      sv: data?.fairwayCard?.name?.sv ?? '',
      en: data?.fairwayCard?.name?.en ?? '',
    },
    n2000HeightSystem: data?.fairwayCard?.n2000HeightSystem ?? false,
    status: origin ? Status.Draft : data?.fairwayCard?.status ?? Status.Draft,
    fairwayIds: data?.fairwayCard?.fairways.flatMap((fairway) => fairway.id) ?? [],
    harbors: data?.fairwayCard?.harbors?.flatMap((harbor) => harbor.id) ?? [],
    primaryFairwayId: data?.fairwayCard?.fairways.find((fairway) => fairway.primary)?.id ?? 0,
    secondaryFairwayId: data?.fairwayCard?.fairways.find((fairway) => fairway.secondary)?.id ?? 0,
    lineText: {
      fi: data?.fairwayCard?.lineText?.fi ?? '',
      sv: data?.fairwayCard?.lineText?.sv ?? '',
      en: data?.fairwayCard?.lineText?.en ?? '',
    },
    designSpeed: {
      fi: data?.fairwayCard?.designSpeed?.fi ?? '',
      sv: data?.fairwayCard?.designSpeed?.sv ?? '',
      en: data?.fairwayCard?.designSpeed?.en ?? '',
    },
    speedLimit: {
      fi: data?.fairwayCard?.speedLimit?.fi ?? '',
      sv: data?.fairwayCard?.speedLimit?.sv ?? '',
      en: data?.fairwayCard?.speedLimit?.en ?? '',
    },
    anchorage: {
      fi: data?.fairwayCard?.anchorage?.fi ?? '',
      sv: data?.fairwayCard?.anchorage?.sv ?? '',
      en: data?.fairwayCard?.anchorage?.en ?? '',
    },
    navigationCondition: {
      fi: data?.fairwayCard?.navigationCondition?.fi ?? '',
      sv: data?.fairwayCard?.navigationCondition?.sv ?? '',
      en: data?.fairwayCard?.navigationCondition?.en ?? '',
    },
    iceCondition: {
      fi: data?.fairwayCard?.iceCondition?.fi ?? '',
      sv: data?.fairwayCard?.iceCondition?.sv ?? '',
      en: data?.fairwayCard?.iceCondition?.en ?? '',
    },
    windRecommendation: {
      fi: data?.fairwayCard?.windRecommendation?.fi ?? '',
      sv: data?.fairwayCard?.windRecommendation?.sv ?? '',
      en: data?.fairwayCard?.windRecommendation?.en ?? '',
    },
    vesselRecommendation: {
      fi: data?.fairwayCard?.vesselRecommendation?.fi ?? '',
      sv: data?.fairwayCard?.vesselRecommendation?.sv ?? '',
      en: data?.fairwayCard?.vesselRecommendation?.en ?? '',
    },
    visibility: {
      fi: data?.fairwayCard?.visibility?.fi ?? '',
      sv: data?.fairwayCard?.visibility?.sv ?? '',
      en: data?.fairwayCard?.visibility?.en ?? '',
    },
    windGauge: {
      fi: data?.fairwayCard?.windGauge?.fi ?? '',
      sv: data?.fairwayCard?.windGauge?.sv ?? '',
      en: data?.fairwayCard?.windGauge?.en ?? '',
    },
    seaLevel: {
      fi: data?.fairwayCard?.seaLevel?.fi ?? '',
      sv: data?.fairwayCard?.seaLevel?.sv ?? '',
      en: data?.fairwayCard?.seaLevel?.en ?? '',
    },
    trafficService: {
      pilot: {
        email: data?.fairwayCard?.trafficService?.pilot?.email ?? '',
        phoneNumber: data?.fairwayCard?.trafficService?.pilot?.phoneNumber ?? '',
        fax: data?.fairwayCard?.trafficService?.pilot?.fax ?? '',
        extraInfo: {
          fi: data?.fairwayCard?.trafficService?.pilot?.extraInfo?.fi ?? '',
          sv: data?.fairwayCard?.trafficService?.pilot?.extraInfo?.sv ?? '',
          en: data?.fairwayCard?.trafficService?.pilot?.extraInfo?.en ?? '',
        },
        places: data?.fairwayCard?.trafficService?.pilot?.places?.map((pilotPlace) => {
          return {
            ...pilotPlace,
            pilotJourney: pilotPlace.pilotJourney?.toString() ?? '',
          };
        }),
      },
      vts: data?.fairwayCard?.trafficService?.vts?.map((vts) => {
        return {
          email: vts?.email,
          name: { fi: vts?.name?.fi ?? '', sv: vts?.name?.sv ?? '', en: vts?.name?.en ?? '' },
          phoneNumber: vts?.phoneNumber,
          vhf: vts?.vhf?.map((vhf) => {
            return {
              channel: vhf?.channel?.toString() ?? '',
              name: { fi: vhf?.name?.fi ?? '', sv: vhf?.name?.sv ?? '', en: vhf?.name?.en ?? '' },
            };
          }),
        };
      }),
      tugs: data?.fairwayCard?.trafficService?.tugs?.map((tug) => {
        return {
          email: tug?.email,
          name: { fi: tug?.name?.fi ?? '', sv: tug?.name?.sv ?? '', en: tug?.name?.en ?? '' },
          phoneNumber: tug?.phoneNumber?.map((phone) => phone ?? ''),
          fax: tug?.fax,
        };
      }),
    },
    operation: origin ? Operation.Create : Operation.Update,
    pictures: origin ? [] : data?.fairwayCard?.pictures ?? [],
  };

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
