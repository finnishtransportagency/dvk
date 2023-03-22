import { PilotPlaceInput } from '../graphql/generated';

export type Lang = 'fi' | 'sv' | 'en';

export type ItemType = '' | 'CARD' | 'HARBOR';

export type ValueType = boolean | number | string | number[] | string[] | PilotPlaceInput[];
export type ActionType =
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
  | 'pilotJourney';
export type ActionTypeSelect = 'fairwayIds' | 'fairwayPrimary' | 'fairwaySecondary' | 'harbours' | 'status' | 'referenceLevel' | 'pilotPlaces';
