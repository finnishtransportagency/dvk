import { PilotPlaceInput } from '../graphql/generated';

export type Lang = 'fi' | 'sv' | 'en';

export type ItemType = '' | 'CARD' | 'HARBOR';

export type ValidationType = {
  id: string;
  msg: string;
};

export type ErrorMessageType = {
  required: string;
  duplicateId: string;
};

export type ValueType = boolean | number | string | number[] | string[] | PilotPlaceInput[];

export type HarbourActionType =
  | 'name'
  | 'primaryId'
  | 'extraInfo'
  | 'cargo'
  | 'harbourBasin'
  | 'companyName'
  | 'email'
  | 'phoneNumber'
  | 'fax'
  | 'internet'
  | 'lat'
  | 'lon'
  | 'quay'
  | 'quayName'
  | 'quayLength'
  | 'quayLat'
  | 'quayLon'
  | 'quayExtraInfo'
  | 'section'
  | 'sectionName'
  | 'sectionDepth'
  | 'sectionLat'
  | 'sectionLon';

export type FairwayCardActionType =
  | 'name'
  | 'primaryId'
  | 'line'
  | 'speedLimit'
  | 'designSpeed'
  | 'anchorage'
  | 'navigationCondition'
  | 'iceCondition'
  | 'windRecommendation'
  | 'vesselRecommendation'
  | 'visibility'
  | 'windGauge'
  | 'seaLevel'
  | 'pilotEmail'
  | 'pilotExtraInfo'
  | 'pilotPhone'
  | 'pilotFax'
  | 'pilotJourney'
  | 'vts'
  | 'vtsName'
  | 'vtsPhone'
  | 'vtsEmail'
  | 'tug'
  | 'tugName'
  | 'tugPhone'
  | 'tugEmail'
  | 'tugFax'
  | 'vhf'
  | 'vhfName'
  | 'vhfChannel';

export type FairwayCardActionTypeSelect =
  | 'fairwayIds'
  | 'fairwayPrimary'
  | 'fairwaySecondary'
  | 'harbours'
  | 'status'
  | 'referenceLevel'
  | 'group'
  | 'pilotPlaces';

export type ActionType = HarbourActionType | FairwayCardActionType | FairwayCardActionTypeSelect;
