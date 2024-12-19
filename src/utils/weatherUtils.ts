/* eslint-disable @typescript-eslint/no-explicit-any */
import { LimitStatus } from '../graphql/generated';

export type Limit = {
  lowerLimit?: number | null;
  upperLimit?: number | null;
  status: LimitStatus;
};

export type WeatherLimitById = {
  id: string;
  type: string;
  windLimits: Array<Limit>;
  windGustLimits: Array<Limit>;
  waveLimits: Array<Limit>;
  visibilityLimits: Array<Limit>;
};

export type WeatherLimitsList = {
  limits: Array<WeatherLimitById>;
};

export const formatLimitStatus = (status: LimitStatus): string => {
  const statusMap: Record<LimitStatus, string> = {
    [LimitStatus.Green]: 'Green',
    [LimitStatus.Yellow]: 'Yellow',
    [LimitStatus.Red]: 'Red',
  };

  return statusMap[status];
};

export const asWeatherLimits = (value: unknown): WeatherLimitsList | undefined => {
  if (!value || typeof value !== 'object') return undefined;

  const obj = value as any;
  if (!Array.isArray(obj.limits)) return undefined;

  // Basic validation of the structure
  const isValid = obj.limits.every(
    (limit: any) =>
      typeof limit === 'object' &&
      typeof limit.id === 'string' &&
      typeof limit.type === 'string' &&
      Array.isArray(limit.windLimits) &&
      Array.isArray(limit.waveLimits) &&
      Array.isArray(limit.visibilityLimits) &&
      limit.windLimits.every(
        (l: any) =>
          typeof l.status === 'string' &&
          (l.lowerLimit === null || typeof l.lowerLimit === 'number') &&
          (l.upperLimit === null || typeof l.upperLimit === 'number')
      ) &&
      limit.waveLimits.every(
        (l: any) =>
          typeof l.status === 'string' &&
          (l.lowerLimit === null || typeof l.lowerLimit === 'number') &&
          (l.upperLimit === null || typeof l.upperLimit === 'number')
      ) &&
      limit.visibilityLimits.every(
        (l: any) =>
          typeof l.status === 'string' &&
          (l.lowerLimit === null || typeof l.lowerLimit === 'number') &&
          (l.upperLimit === null || typeof l.upperLimit === 'number')
      ) &&
      limit.windGustLimits.every(
        (l: any) =>
          typeof l.status === 'string' &&
          (l.lowerLimit === null || typeof l.lowerLimit === 'number') &&
          (l.upperLimit === null || typeof l.upperLimit === 'number')
      )
  );

  return isValid ? (value as WeatherLimitsList) : undefined;
};

export const findWeatherLimitById = (limits?: WeatherLimitsList, id?: string): WeatherLimitById | undefined => {
  if (!limits?.limits?.length || !id) {
    return undefined;
  }

  const result = limits.limits.find((limit) => limit.id == id);

  return result;
};

export const determineWeatherStatus = (value: number, limits: Limit[] | undefined): string | undefined => {
  if (!limits) return undefined;
  for (const limit of limits) {
    if (limit.lowerLimit && limit.upperLimit) {
      if (value >= limit.lowerLimit && value <= limit.upperLimit) {
        return formatLimitStatus(limit.status);
      }
    } else if (limit.lowerLimit && value >= limit.lowerLimit) {
      return formatLimitStatus(limit.status);
    } else if (limit.upperLimit && value <= limit.upperLimit) {
      return formatLimitStatus(limit.status);
    }
  }
  return undefined;
};
