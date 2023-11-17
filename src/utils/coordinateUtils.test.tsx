import { coordinatesToStringHDM } from './coordinateUtils';

test('if conversion from coordinates to HDM is correct', () => {
  expect(coordinatesToStringHDM(undefined)).toEqual('');
  expect(coordinatesToStringHDM([23.005167, 59.781167])).toEqual('59° 46,87′ N 23° 00,31′ E');
  expect(coordinatesToStringHDM([-191.9668, -46.4119])).toEqual('46° 24,71′ S 168° 01,99′ E');
  expect(coordinatesToStringHDM([28.17, 61.52283])).toEqual('61° 31,37′ N 28° 10,20′ E');
  expect(coordinatesToStringHDM([22.8075, 59.88167])).toEqual('59° 52,90′ N 22° 48,45′ E');
  expect(coordinatesToStringHDM([28.30383, 61.071])).toEqual('61° 04,26′ N 28° 18,23′ E');
  expect(coordinatesToStringHDM([19.842, 60.016])).toEqual('60° 00,96′ N 19° 50,52′ E');
  expect(coordinatesToStringHDM([23.09667, 59.70833])).toEqual('59° 42,50′ N 23° 05,80′ E');
  expect(coordinatesToStringHDM([29.205, 62.15617])).toEqual('62° 09,37′ N 29° 12,30′ E');
});
