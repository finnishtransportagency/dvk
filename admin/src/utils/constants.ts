export type Lang = 'fi' | 'sv' | 'en';

export type ItemType = '' | 'CARD' | 'HARBOR';

export type ValueType = boolean | number | string | number[] | string[];
export type ActionType =
  | 'nameFi'
  | 'nameSv'
  | 'nameEn'
  | 'primaryId'
  | 'lineFi'
  | 'lineSv'
  | 'lineEn'
  | 'speedLimitFi'
  | 'speedLimitSv'
  | 'speedLimitEn'
  | 'designSpeedFi'
  | 'designSpeedSv'
  | 'designSpeedEn'
  | 'anchorageFi'
  | 'anchorageSv'
  | 'anchorageEn'
  | 'navigationConditionFi'
  | 'navigationConditionSv'
  | 'navigationConditionEn'
  | 'iceConditionFi'
  | 'iceConditionSv'
  | 'iceConditionEn'
  | 'windRecommendationFi'
  | 'windRecommendationSv'
  | 'windRecommendationEn'
  | 'vesselRecommendationFi'
  | 'vesselRecommendationSv'
  | 'vesselRecommendationEn'
  | 'visibilityFi'
  | 'visibilitySv'
  | 'visibilityEn'
  | 'windGaugeFi'
  | 'windGaugeSv'
  | 'windGaugeEn'
  | 'seaLevelFi'
  | 'seaLevelSv'
  | 'seaLevelEn';
export type ActionTypeSelect = 'fairwayIds' | 'fairwayPrimary' | 'fairwaySecondary' | 'harbours' | 'status' | 'referenceLevel';
