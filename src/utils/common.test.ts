import { mockFairwayList } from '../../__tests__/mockData';
import { filterFairways } from './common';
import { MINIMUM_QUERYLENGTH } from './constants';

jest.mock('./common', () => {
  const originalModule = jest.requireActual('./common');

  //Mock the named export 'isMobile'
  return {
    __esModule: true,
    ...originalModule,
    isMobile: jest.fn(() => false),
  };
});

test('if fairway filtering is correct', () => {
  expect(filterFairways(mockFairwayList.fairwayCards, 'fi', 'aan')).toHaveLength(2);
  expect(filterFairways(mockFairwayList.fairwayCards, 'fi', 'testi')).toHaveLength(0);
  expect(filterFairways(mockFairwayList.fairwayCards, 'fi', 'han')).toHaveLength(2);
  expect(filterFairways(mockFairwayList.fairwayCards, 'fi', 'naantalin'.slice(0, MINIMUM_QUERYLENGTH - 2))).toHaveLength(0);
});
