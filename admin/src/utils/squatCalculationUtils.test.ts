import {
  filterOrphanedAreas,
  getOrphanedAreaIdsFromSquatCalculationInput,
  getOrphanedAreaIdsFromSquatSection,
  getPossibleAreas,
} from './squatCalculationUtils';
import { SquatCalculationInput } from '../graphql/generated';
import { AreaSelectOption } from './constants';

test('should locate orphaned area in squat calculation', () => {
  const input: SquatCalculationInput = {
    place: { fi: '', sv: '', en: '' },
    suitableFairwayAreas: [1, 2, 3],
  };

  expect(getOrphanedAreaIdsFromSquatCalculationInput(input, [{ id: 4 }])).toEqual([1, 2, 3]);
  expect(getOrphanedAreaIdsFromSquatCalculationInput(input, [{ id: 1 }])).toEqual([2, 3]);
  expect(getOrphanedAreaIdsFromSquatCalculationInput(input, [{ id: 1 }, { id: 2 }])).toEqual([3]);
  expect(getOrphanedAreaIdsFromSquatCalculationInput(input, [{ id: 1 }, { id: 2 }, { id: 3 }])).toEqual([]);
});

test('should locate orphaned area in array of squat calculations', () => {
  const input: SquatCalculationInput[] = [
    {
      place: { fi: '', sv: '', en: '' },
      suitableFairwayAreas: [1],
    },
    {
      place: { fi: '', sv: '', en: '' },
      suitableFairwayAreas: [2, 3],
    },
  ];

  expect(getOrphanedAreaIdsFromSquatSection(input, [{ id: 4 }])).toEqual([1, 2, 3]);
  expect(getOrphanedAreaIdsFromSquatSection(input, [{ id: 1 }])).toEqual([2, 3]);
  expect(getOrphanedAreaIdsFromSquatSection(input, [{ id: 1 }, { id: 2 }])).toEqual([3]);
  expect(getOrphanedAreaIdsFromSquatSection(input, [{ id: 1 }, { id: 2 }, { id: 3 }])).toEqual([]);
});

test('should filter orphaned areas from input', () => {
  const areas: AreaSelectOption[] = [
    {
      id: 1,
      depth: 11,
    },
    {
      id: 2,
      depth: 10,
    },
  ];
  const input: SquatCalculationInput[] = [
    {
      place: { fi: '', sv: '', en: '' },
      suitableFairwayAreas: [1],
      depth: 9,
    },
    {
      place: { fi: '', sv: '', en: '' },
      suitableFairwayAreas: [2, 3],
      depth: 9,
    },
    {
      place: { fi: '', sv: '', en: '' },
      suitableFairwayAreas: [1, 2],
      depth: 9,
    },
    {
      place: { fi: '', sv: '', en: '' },
      suitableFairwayAreas: [3, 4],
      depth: 9,
    },
  ];
  const output: SquatCalculationInput[] = filterOrphanedAreas(input, areas) ?? [];
  expect(output).toHaveLength(input.length);
  expect(output[0].suitableFairwayAreas).toEqual([1]);
  expect(output[0].depth).toEqual(9);

  expect(output[1].suitableFairwayAreas).toEqual([2]);
  expect(output[1].depth).toEqual(10);

  expect(output[2].suitableFairwayAreas).toEqual([1, 2]);
  expect(output[2].depth).toEqual(9);

  expect(output[3].suitableFairwayAreas).toEqual([]);
  expect(output[3].depth).toEqual(0);
});

test('should empty area area does not filter orphaned areas from input', () => {
  const areas: AreaSelectOption[] = [];
  const input: SquatCalculationInput[] = [
    {
      place: { fi: '', sv: '', en: '' },
      suitableFairwayAreas: [1, 2, 3],
      depth: 9,
    },
  ];
  const output: SquatCalculationInput[] = filterOrphanedAreas(input, areas) ?? [];
  expect(output).toHaveLength(input.length);
  expect(output[0].suitableFairwayAreas).toEqual([1, 2, 3]);
});

test('should filter correct area options based on fairway ids', () => {
  const areaOptions: AreaSelectOption[] = [
    { id: 1, fairwayIds: [10] },
    { id: 2, fairwayIds: [20] },
    { id: 3, fairwayIds: [10, 20] },
  ];
  const output: AreaSelectOption[] = getPossibleAreas(areaOptions, [10]);
  expect(output).toHaveLength(2);
  expect(
    output
      .map((o) => o.id as number)
      .sort((a, b) => {
        return a - b;
      })
  ).toEqual([1, 3]);
});
