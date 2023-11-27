import { coordinatesToStringHDM } from './coordinateUtils';

test('if conversion from coordinates to HDM is correct', () => {
  expect(coordinatesToStringHDM(undefined)).toEqual('');
  expect(coordinatesToStringHDM([23.005167, 59.781167])).toEqual('59° 46,87′ N 23° 00,31′ E');
  expect(coordinatesToStringHDM([-191.9668, -46.4119])).toEqual('46° 24,71′ S 168° 01,99′ E');
  expect(coordinatesToStringHDM([24.44833, 65.55167])).toEqual('65° 33,10′ N 24° 26,90′ E');
  expect(coordinatesToStringHDM([22.81819, 64.00867])).toEqual('64° 00,52′ N 22° 49,09′ E');
  expect(coordinatesToStringHDM([20.75634, 63.20167])).toEqual('63° 12,10′ N 20° 45,38′ E');
  expect(coordinatesToStringHDM([20.99833, 60.70167])).toEqual('60° 42,10′ N 20° 59,90′ E');
  expect(coordinatesToStringHDM([24.23667, 59.92767])).toEqual('59° 55,66′ N 24° 14,20′ E');
  expect(coordinatesToStringHDM([25.16309, 60.08269])).toEqual('60° 04,96′ N 25° 09,79′ E');
  expect(coordinatesToStringHDM([27.28167, 60.25083])).toEqual('60° 15,05′ N 27° 16,90′ E');
  expect(coordinatesToStringHDM([28.17, 61.52283])).toEqual('61° 31,37′ N 28° 10,20′ E');
  expect(coordinatesToStringHDM([22.8075, 59.88167])).toEqual('59° 52,90′ N 22° 48,45′ E');
  expect(coordinatesToStringHDM([28.30383, 61.071])).toEqual('61° 04,26′ N 28° 18,23′ E');
  expect(coordinatesToStringHDM([19.842, 60.016])).toEqual('60° 00,96′ N 19° 50,52′ E');
  expect(coordinatesToStringHDM([23.09667, 59.70833])).toEqual('59° 42,50′ N 23° 05,80′ E');
  expect(coordinatesToStringHDM([29.205, 62.15617])).toEqual('62° 09,37′ N 29° 12,30′ E');
});
