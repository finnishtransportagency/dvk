import { isCloudFrontCacheKey } from "../lib/cache"


it('returns true for valid cache keys', () => {
  expect(isCloudFrontCacheKey('aislocations')).toBe(true);
  expect(isCloudFrontCacheKey('aisvessels')).toBe(true);
  expect(isCloudFrontCacheKey('mareograph')).toBe(true);
  expect(isCloudFrontCacheKey('observation')).toBe(true);
  expect(isCloudFrontCacheKey('buoy')).toBe(true);
  expect(isCloudFrontCacheKey('marinewarning')).toBe(true);
  expect(isCloudFrontCacheKey('feature')).toBe(true);
  expect(isCloudFrontCacheKey('pilotroutes')).toBe(true);
  expect(isCloudFrontCacheKey('forecast')).toBe(true);
})

it('returns false for invalid cache keys', () => {
  expect(isCloudFrontCacheKey('circle')).toBe(false);
  expect(isCloudFrontCacheKey('pilotplaces')).toBe(false);
  expect(isCloudFrontCacheKey('fairways')).toBe(false);
})