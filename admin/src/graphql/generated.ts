import { useQuery, UseQueryOptions } from '@tanstack/react-query';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };

function fetcher<TData, TVariables>(endpoint: string, requestInit: RequestInit, query: string, variables?: TVariables) {
  return async (): Promise<TData> => {
    const res = await fetch(endpoint, {
      method: 'POST',
      ...requestInit,
      body: JSON.stringify({ query, variables }),
    });

    const json = await res.json();

    if (json.errors) {
      const { message } = json.errors[0];

      throw new Error(message);
    }

    return json.data;
  }
}
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Area = {
  __typename?: 'Area';
  additionalInformation?: Maybe<Scalars['String']>;
  depth?: Maybe<Scalars['Float']>;
  direction?: Maybe<Scalars['Float']>;
  draft?: Maybe<Scalars['Float']>;
  fairways?: Maybe<Array<AreaFairway>>;
  geometry?: Maybe<GeometryPolygon>;
  id: Scalars['Int'];
  journalNumber?: Maybe<Scalars['String']>;
  n2000ReferenceLevel?: Maybe<Scalars['String']>;
  n2000depth?: Maybe<Scalars['Float']>;
  n2000draft?: Maybe<Scalars['Float']>;
  name?: Maybe<Scalars['String']>;
  notation?: Maybe<Scalars['String']>;
  notationCode?: Maybe<Scalars['Float']>;
  operationDirection?: Maybe<Scalars['String']>;
  operationDirectionCode?: Maybe<Scalars['Float']>;
  operationStatus?: Maybe<Scalars['String']>;
  operationStatusCode?: Maybe<Scalars['Float']>;
  operationType?: Maybe<Scalars['String']>;
  operationTypeCode?: Maybe<Scalars['Float']>;
  owner?: Maybe<Scalars['String']>;
  referenceLevel?: Maybe<Scalars['String']>;
  type?: Maybe<Scalars['String']>;
  typeCode?: Maybe<Scalars['Int']>;
  verificationDate?: Maybe<Scalars['String']>;
};

export type AreaFairway = {
  __typename?: 'AreaFairway';
  fairwayId: Scalars['Int'];
  line?: Maybe<Scalars['Int']>;
  sequenceNumber?: Maybe<Scalars['Int']>;
  sizingSpeed?: Maybe<Scalars['Float']>;
  sizingSpeed2?: Maybe<Scalars['Float']>;
  status?: Maybe<Scalars['Int']>;
};

export type Boardline = {
  __typename?: 'Boardline';
  direction?: Maybe<Scalars['Float']>;
  fairways?: Maybe<Array<BoardlineFairway>>;
  geometry?: Maybe<GeometryLine>;
  id: Scalars['Int'];
};

export type BoardlineFairway = {
  __typename?: 'BoardlineFairway';
  fairwayId: Scalars['Int'];
};

export type Classification = {
  __typename?: 'Classification';
  fairwayClass?: Maybe<Text>;
  fairwayClassCode?: Maybe<Scalars['String']>;
  type?: Maybe<Scalars['String']>;
};

export type CurrentUser = {
  __typename?: 'CurrentUser';
  name?: Maybe<Scalars['String']>;
};

export type Fairway = {
  __typename?: 'Fairway';
  area?: Maybe<Text>;
  areas?: Maybe<Array<Area>>;
  boardLines?: Maybe<Array<Boardline>>;
  classifications?: Maybe<Array<Classification>>;
  endText?: Maybe<Scalars['String']>;
  geotiffImages?: Maybe<Array<Maybe<Scalars['String']>>>;
  id: Scalars['Int'];
  lighting?: Maybe<Text>;
  lightingCode?: Maybe<Scalars['String']>;
  name?: Maybe<Text>;
  navigationLines?: Maybe<Array<NavigationLine>>;
  owner?: Maybe<Scalars['String']>;
  primary?: Maybe<Scalars['Boolean']>;
  restrictionAreas?: Maybe<Array<RestrictionArea>>;
  sizing?: Maybe<Sizing>;
  sizingVessels?: Maybe<Array<SizingVessel>>;
  startText?: Maybe<Scalars['String']>;
  type?: Maybe<Text>;
  typeCode?: Maybe<Scalars['String']>;
};

export type FairwayCard = {
  __typename?: 'FairwayCard';
  anchorage?: Maybe<Text>;
  attention?: Maybe<Text>;
  designSpeed?: Maybe<Text>;
  fairwayIds?: Maybe<Scalars['String']>;
  fairways: Array<Fairway>;
  generalInfo?: Maybe<Text>;
  group?: Maybe<Scalars['String']>;
  harbors?: Maybe<Array<Harbor>>;
  iceCondition?: Maybe<Text>;
  id: Scalars['ID'];
  lineText?: Maybe<Text>;
  modificationTimestamp?: Maybe<Scalars['Float']>;
  n2000HeightSystem: Scalars['Boolean'];
  name: Text;
  navigationCondition?: Maybe<Text>;
  seaLevel?: Maybe<Text>;
  speedLimit?: Maybe<Text>;
  trafficService?: Maybe<TrafficService>;
  vesselRecommendation?: Maybe<Text>;
  visibility?: Maybe<Text>;
  windGauge?: Maybe<Text>;
  windRecommendation?: Maybe<Text>;
};

export type GeometryLine = {
  __typename?: 'GeometryLine';
  coordinates?: Maybe<Array<Maybe<Array<Maybe<Scalars['Float']>>>>>;
  type?: Maybe<Scalars['String']>;
};

export type GeometryPoint = {
  __typename?: 'GeometryPoint';
  coordinates?: Maybe<Array<Maybe<Scalars['Float']>>>;
  type?: Maybe<Scalars['String']>;
};

export type GeometryPolygon = {
  __typename?: 'GeometryPolygon';
  coordinates?: Maybe<Array<Maybe<Array<Maybe<Array<Maybe<Scalars['Float']>>>>>>>;
  type?: Maybe<Scalars['String']>;
};

export type Harbor = {
  __typename?: 'Harbor';
  cargo?: Maybe<Array<Maybe<Text>>>;
  company?: Maybe<Text>;
  email?: Maybe<Scalars['String']>;
  extraInfo?: Maybe<Text>;
  fax?: Maybe<Scalars['String']>;
  geometry?: Maybe<GeometryPoint>;
  harborBasin?: Maybe<Text>;
  id: Scalars['String'];
  internet?: Maybe<Scalars['String']>;
  name?: Maybe<Text>;
  phoneNumber?: Maybe<Array<Maybe<Scalars['String']>>>;
  quays?: Maybe<Array<Maybe<Quay>>>;
};

export type MarineWarning = {
  __typename?: 'MarineWarning';
  area: Text;
  areaId?: Maybe<Scalars['Float']>;
  dateTime: Scalars['Float'];
  description: Text;
  endDateTime?: Maybe<Scalars['Float']>;
  equipmentId?: Maybe<Scalars['Float']>;
  id: Scalars['Int'];
  lineId?: Maybe<Scalars['Float']>;
  location: Text;
  notifier: Scalars['String'];
  number: Scalars['Int'];
  startDateTime?: Maybe<Scalars['Float']>;
  type: Text;
};

export type NavigationLine = {
  __typename?: 'NavigationLine';
  additionalInformation?: Maybe<Scalars['String']>;
  depth?: Maybe<Scalars['Float']>;
  direction?: Maybe<Scalars['Float']>;
  draft?: Maybe<Scalars['Float']>;
  fairways?: Maybe<Array<NavigationLineFairway>>;
  geometry: GeometryLine;
  id: Scalars['Int'];
  journalNumber?: Maybe<Scalars['String']>;
  length?: Maybe<Scalars['Float']>;
  n2000ReferenceLevel?: Maybe<Scalars['String']>;
  n2000depth?: Maybe<Scalars['Float']>;
  n2000draft?: Maybe<Scalars['Float']>;
  owner?: Maybe<Scalars['String']>;
  referenceLevel?: Maybe<Scalars['String']>;
  type?: Maybe<Scalars['String']>;
  typeCode?: Maybe<Scalars['String']>;
  verificationDate?: Maybe<Scalars['String']>;
};

export type NavigationLineFairway = {
  __typename?: 'NavigationLineFairway';
  fairwayId: Scalars['Int'];
  line?: Maybe<Scalars['Int']>;
  status?: Maybe<Scalars['Int']>;
};

export type Pilot = {
  __typename?: 'Pilot';
  email?: Maybe<Scalars['String']>;
  extraInfo?: Maybe<Text>;
  fax?: Maybe<Scalars['String']>;
  internet?: Maybe<Scalars['String']>;
  phoneNumber?: Maybe<Scalars['String']>;
  places?: Maybe<Array<PilotPlace>>;
};

export type PilotPlace = {
  __typename?: 'PilotPlace';
  geometry: GeometryPoint;
  id: Scalars['Float'];
  name: Scalars['String'];
  pilotJourney?: Maybe<Scalars['Float']>;
};

export type Quay = {
  __typename?: 'Quay';
  extraInfo?: Maybe<Text>;
  geometry?: Maybe<GeometryPoint>;
  length?: Maybe<Scalars['Float']>;
  name?: Maybe<Text>;
  sections?: Maybe<Array<Maybe<Section>>>;
};

export type Query = {
  __typename?: 'Query';
  currentUser?: Maybe<CurrentUser>;
  fairwayCard?: Maybe<FairwayCard>;
  fairwayCards: Array<FairwayCard>;
  fairwayCardsByFairwayId?: Maybe<Array<Maybe<FairwayCard>>>;
  marineWarnings: Array<MarineWarning>;
  safetyEquipmentFaults: Array<SafetyEquipmentFault>;
};


export type QueryFairwayCardArgs = {
  id: Scalars['String'];
};


export type QueryFairwayCardsByFairwayIdArgs = {
  id: Scalars['Int'];
};

export type RestrictionArea = {
  __typename?: 'RestrictionArea';
  endDate?: Maybe<Scalars['String']>;
  exception?: Maybe<Scalars['String']>;
  fairways?: Maybe<Array<RestrictionFairway>>;
  geometry?: Maybe<GeometryPolygon>;
  id: Scalars['Int'];
  journalNumber?: Maybe<Scalars['String']>;
  location?: Maybe<Scalars['String']>;
  modificationDate?: Maybe<Scalars['String']>;
  municipality?: Maybe<Scalars['String']>;
  presenter?: Maybe<Scalars['String']>;
  source?: Maybe<Scalars['String']>;
  startDate?: Maybe<Scalars['String']>;
  status?: Maybe<Scalars['String']>;
  types?: Maybe<Array<RestrictionType>>;
  value?: Maybe<Scalars['Float']>;
  verificationDate?: Maybe<Scalars['String']>;
};

export type RestrictionFairway = {
  __typename?: 'RestrictionFairway';
  fairwayId: Scalars['Int'];
};

export type RestrictionType = {
  __typename?: 'RestrictionType';
  code?: Maybe<Scalars['String']>;
  text?: Maybe<Scalars['String']>;
};

export type SafetyEquipmentFault = {
  __typename?: 'SafetyEquipmentFault';
  equipmentId: Scalars['Int'];
  geometry: GeometryPoint;
  id: Scalars['Int'];
  name?: Maybe<Text>;
  recordTime: Scalars['Float'];
  type?: Maybe<Text>;
  typeCode: Scalars['Int'];
};

export type Section = {
  __typename?: 'Section';
  depth?: Maybe<Scalars['Float']>;
  geometry?: Maybe<GeometryPoint>;
  name?: Maybe<Scalars['String']>;
};

export type Sizing = {
  __typename?: 'Sizing';
  additionalInformation?: Maybe<Scalars['String']>;
  mareograph?: Maybe<Scalars['String']>;
  minimumTurningCircle?: Maybe<Scalars['Float']>;
  minimumWidth?: Maybe<Scalars['Float']>;
  normalTurningCircle?: Maybe<Scalars['Float']>;
  normalWidth?: Maybe<Scalars['Float']>;
  reserveWater?: Maybe<Scalars['String']>;
};

export type SizingVessel = {
  __typename?: 'SizingVessel';
  bodyFactor?: Maybe<Scalars['Float']>;
  draft?: Maybe<Scalars['Float']>;
  length?: Maybe<Scalars['Float']>;
  size?: Maybe<Scalars['Float']>;
  type?: Maybe<Scalars['String']>;
  typeCode?: Maybe<Scalars['String']>;
  width?: Maybe<Scalars['Float']>;
};

export type Text = {
  __typename?: 'Text';
  en?: Maybe<Scalars['String']>;
  fi?: Maybe<Scalars['String']>;
  sv?: Maybe<Scalars['String']>;
};

export type TrafficService = {
  __typename?: 'TrafficService';
  pilot?: Maybe<Pilot>;
  tugs?: Maybe<Array<Maybe<Tug>>>;
  vts?: Maybe<Array<Maybe<Vts>>>;
};

export type Tug = {
  __typename?: 'Tug';
  email?: Maybe<Scalars['String']>;
  fax?: Maybe<Scalars['String']>;
  name?: Maybe<Text>;
  phoneNumber?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type Vhf = {
  __typename?: 'VHF';
  channel?: Maybe<Scalars['Int']>;
  name?: Maybe<Text>;
};

export type Vts = {
  __typename?: 'VTS';
  email?: Maybe<Array<Maybe<Scalars['String']>>>;
  name?: Maybe<Text>;
  phoneNumber?: Maybe<Scalars['String']>;
  vhf?: Maybe<Array<Maybe<Vhf>>>;
};

export type CurrentUserQueryVariables = Exact<{ [key: string]: never; }>;


export type CurrentUserQuery = { __typename?: 'Query', currentUser?: { __typename?: 'CurrentUser', name?: string | null } | null };


export const CurrentUserDocument = `
    query currentUser {
  currentUser {
    name
  }
}
    `;
export const useCurrentUserQuery = <
      TData = CurrentUserQuery,
      TError = unknown
    >(
      dataSource: { endpoint: string, fetchParams?: RequestInit },
      variables?: CurrentUserQueryVariables,
      options?: UseQueryOptions<CurrentUserQuery, TError, TData>
    ) =>
    useQuery<CurrentUserQuery, TError, TData>(
      variables === undefined ? ['currentUser'] : ['currentUser', variables],
      fetcher<CurrentUserQuery, CurrentUserQueryVariables>(dataSource.endpoint, dataSource.fetchParams || {}, CurrentUserDocument, variables),
      options
    );