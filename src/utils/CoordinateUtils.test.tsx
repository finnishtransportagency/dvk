import { coordinatesToStringHDM } from './CoordinateUtils';

test('if conversion from coordinates to HDM is correct', () => {
  expect(coordinatesToStringHDM(undefined)).toEqual('');
  expect(coordinatesToStringHDM([23.005167, 59.781167])).toEqual('59° 46,88′ N 23° 00,32′ E');
  expect(coordinatesToStringHDM([-191.9668, -46.4119])).toEqual('46° 24,72′ S 168° 02,00′ E');
});
