export type Lang = 'fi' | 'sv' | 'en';

export type ItemType = '' | 'CARD' | 'HARBOR';

export type ValueType = boolean | number | string | number[] | string[];

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
  | 'lon';

export type ActionType =
  | HarbourActionType
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
  | 'seaLevel';
export type ActionTypeSelect = 'fairwayIds' | 'fairwayPrimary' | 'fairwaySecondary' | 'harbours' | 'status' | 'referenceLevel';
