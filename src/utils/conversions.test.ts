import { metresToNauticalMiles, nauticalMilesToMeters } from './conversions';

test('if conversion from metres to nautical miles is correct', () => {
  expect(+metresToNauticalMiles(1000).toFixed(2)).toEqual(0.54);
  expect(+metresToNauticalMiles()).toEqual(0);
});

test('if conversion from nautical miles to meters is correct', () => {
  expect(+nauticalMilesToMeters(100).toFixed(2)).toEqual(185200);
});
