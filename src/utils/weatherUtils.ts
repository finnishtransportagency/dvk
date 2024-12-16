import { Limit, LimitStatus, WeatherLimit } from '../graphql/generated';

export const findWeatherLimitById = (limits: WeatherLimit[], id: string): WeatherLimit | undefined => {
  return limits.find((limit) => limit.id === id);
};

export const determineWeatherStatus = (value: number, limits: Limit[]): LimitStatus | undefined => {
  for (const limit of limits) {
    if (limit.lowerLimit && limit.upperLimit) {
      if (value >= limit.lowerLimit && value <= limit.upperLimit) {
        return limit.status;
      }
    } else if (limit.lowerLimit && value >= limit.lowerLimit) {
      return limit.status;
    } else if (limit.upperLimit && value <= limit.upperLimit) {
      return limit.status;
    }
  }
  return undefined;
};
