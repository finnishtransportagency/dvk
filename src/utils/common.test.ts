import { mockFairwayList } from '../../__tests__/mockData';
import { filterFairways } from './common';
import { MINIMUM_QUERYLENGTH } from './constants';
import { vi } from 'vitest';

vi.mock('./common', async () => {
  const originalModule = await vi.importActual<object>('./common');

  //Mock the named export 'isMobile'
  return {
    __esModule: true,
    ...originalModule,
    isMobile: vi.fn(() => false),
  };
});

test('if fairway filtering is correct', () => {
  expect(filterFairways(mockFairwayList.fairwayCards, 'fi', 'aan')).toHaveLength(2);
  expect(filterFairways(mockFairwayList.fairwayCards, 'fi', 'testi')).toHaveLength(0);
  expect(filterFairways(mockFairwayList.fairwayCards, 'fi', 'han')).toHaveLength(2);
  expect(filterFairways(mockFairwayList.fairwayCards, 'fi', 'naantalin'.slice(0, MINIMUM_QUERYLENGTH - 2))).toHaveLength(0);
  expect(filterFairways(mockFairwayList.fairwayCards, 'fi', '')).toHaveLength(0);
  expect(filterFairways(mockFairwayList.fairwayCards, 'fi', '34')).toHaveLength(3);
  expect(filterFairways(mockFairwayList.fairwayCards, 'fi', '123')).toHaveLength(1);
  expect(filterFairways(mockFairwayList.fairwayCards, 'fi', '4567')).toHaveLength(1);
  expect(filterFairways(mockFairwayList.fairwayCards, 'fi', '12345')).toHaveLength(0);
});
