import { FairwayCardPartsFragment, SquatCalculation } from '../graphql/generated';
import { getAreaIdsFromFairwayArray, getOrphanedAreas, getValidSquatCalculations, isSquatAreaOrphaned } from './fairwayCardUtils';

const validSquat: SquatCalculation = { suitableFairwayAreas: [20, 21], targetFairways: [1, 2] };
const invalidSquat: SquatCalculation = { suitableFairwayAreas: [10, 99], targetFairways: [1, 2] };

const baseCard: FairwayCardPartsFragment = {
  id: 'test',
  version: '1',
  n2000HeightSystem: true,
  name: {
    fi: 'Testfi',
    sv: 'Testsv',
    en: 'Testen',
  },
  fairways: [
    {
      id: 1,
      areas: [
        { id: 10, typeCode: 1 },
        { id: 11, typeCode: 1 },
      ],
    },
    {
      id: 2,
      areas: [
        { id: 20, typeCode: 1 },
        { id: 21, typeCode: 1 },
      ],
    },
  ],
};
const cardWithAllOrphanedSquatAreas: FairwayCardPartsFragment = {
  ...baseCard,
  squatCalculations: [invalidSquat, invalidSquat],
};
const cardWithOrphanedSquatAreas: FairwayCardPartsFragment = {
  ...baseCard,
  squatCalculations: [validSquat, invalidSquat],
};
const cardWithNoOrphanedSquatAreas: FairwayCardPartsFragment = {
  ...baseCard,
  squatCalculations: [validSquat, validSquat],
};

test('if the areas from the fairwaycard is correct', () => {
  const areaIds = getAreaIdsFromFairwayArray(cardWithOrphanedSquatAreas.fairways);
  expect(areaIds).toEqual([10, 11, 20, 21]);
});

test('if orphaned areas are found from fairway card', () => {
  expect(isSquatAreaOrphaned(validSquat, cardWithOrphanedSquatAreas)).toBeFalsy();
  expect(isSquatAreaOrphaned(invalidSquat, cardWithOrphanedSquatAreas)).toBeTruthy();
});

test('if returned orphaned areas are correct', () => {
  expect(getOrphanedAreas(validSquat, cardWithOrphanedSquatAreas) as number[]).toMatchObject([]);
  expect(getOrphanedAreas(invalidSquat, cardWithOrphanedSquatAreas) as number[]).toMatchObject([99]);
});

test('if valid squat calculations are returned correctly', () => {
  expect(getValidSquatCalculations(cardWithOrphanedSquatAreas)?.length).toBe(1);
  expect(getValidSquatCalculations(cardWithNoOrphanedSquatAreas)?.length).toBe(2);
  expect(getValidSquatCalculations(cardWithAllOrphanedSquatAreas)?.length).toBe(0);
});
