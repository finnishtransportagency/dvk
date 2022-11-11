import { filterFairways, getCurrentDecimalSeparator } from './common';
import { MINIMUM_QUERYLENGTH } from './constants';

export const mockFairwayList = {
  fairwayCards: [
    { id: 'hanko', name: { fi: 'Hangon meriväylä', sv: 'Hangö havsfarled', en: 'Hanko channel' }, modificationTimestamp: 1667808284, group: '1' },
    {
      id: 'uusikaupunki',
      name: { fi: 'Uudenkaupungin väylä', sv: '[sv] Uudenkaupungin väylä', en: 'Uusikaupunki channel' },
      modificationTimestamp: 1667808285,
      group: '1',
    },
    { id: 'saimaa', name: { fi: 'Saimaan väylä', sv: 'Saimaan väylä', en: 'Saimaan väylä' }, modificationTimestamp: 1667808285, group: null },
    {
      id: 'helsinki',
      name: { fi: 'Helsingin väylä', sv: 'Helsingforsleden', en: 'Helsinki channel' },
      modificationTimestamp: 1667808284,
      group: '2',
    },
    {
      id: 'utohanko',
      name: { fi: 'Utö-Hanko väylä', sv: 'Farleden Utö-Hangö', en: 'Utö-Hanko channel' },
      modificationTimestamp: 1667808284,
      group: '1',
    },
    { id: 'kemi', name: { fi: 'Kemin väylä', sv: '[sv] Kemin väylä', en: 'Kemi Ajos fairway' }, modificationTimestamp: 1667808284, group: '3' },
    {
      id: 'naantali',
      name: { fi: 'Naantalin väylä', sv: 'Farleden Nådendal', en: 'Naantali channel' },
      modificationTimestamp: 1667808285,
      group: '1',
    },
    { id: 'vuosaari', name: { fi: '', sv: 'Nordsjöleden', en: 'Vuosaari channel' }, modificationTimestamp: 1667808285, group: '2' },
  ],
};

test('if current decimal separator is correct by default', () => {
  expect(getCurrentDecimalSeparator()).toEqual(',');
});

test('if fairway filtering is correct', () => {
  expect(filterFairways(mockFairwayList.fairwayCards, 'fi', 'aan')).toHaveLength(2);
  expect(filterFairways(mockFairwayList.fairwayCards, 'fi', 'testi')).toHaveLength(0);
  expect(filterFairways(mockFairwayList.fairwayCards, 'fi', 'han')).toHaveLength(2);
  expect(filterFairways(mockFairwayList.fairwayCards, 'fi', 'naantalin'.slice(0, MINIMUM_QUERYLENGTH - 2))).toHaveLength(0);
});
