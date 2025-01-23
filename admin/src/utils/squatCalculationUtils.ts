import { SquatCalculationInput } from '../graphql/generated';
import { sortAreaSelectOptions } from './common';
import { AreaSelectOption } from './constants';

export function getOrphanedAreaIdsFromSquatSection(squatSections: SquatCalculationInput[], areas: AreaSelectOption[]): number[] {
  const allOrphanedIds: number[] = [];
  squatSections.forEach((s) => {
    getOrphanedAreaIdsFromSquatCalculation(s, areas).forEach((id) => allOrphanedIds.push(id));
  });
  return allOrphanedIds;
}

export function getOrphanedAreaIdsFromSquatCalculation(squatSection: SquatCalculationInput, areas: AreaSelectOption[]): number[] {
  return squatSection.suitableFairwayAreas?.filter((squatArea) => !areas.map((a) => a.id).includes(squatArea)) ?? [];
}

export function filterOrphanedAreas(calcs: SquatCalculationInput[] | undefined, areas: AreaSelectOption[]) {
  if (!calcs) return undefined;
  if (!areas || areas.length === 0) return calcs;
  const filteredCalcs: SquatCalculationInput[] = [...calcs];
  filteredCalcs.forEach((calc) => {
    const numAreas = calc.suitableFairwayAreas?.length;
    calc.suitableFairwayAreas = calc.suitableFairwayAreas?.filter((calcArea) => areas.map((a) => a.id).includes(calcArea));
    if (calc.suitableFairwayAreas?.length != numAreas) {
      const sortedSelectedAreas = sortAreaSelectOptions(areas.filter((a) => calc.suitableFairwayAreas?.includes(a.id as number)));
      calc.depth = sortedSelectedAreas && sortedSelectedAreas.length > 0 ? (sortedSelectedAreas[0].depth ?? 0) : 0;
    }
  });
  return filteredCalcs;
}

export function getPossibleAreas(areas: AreaSelectOption[] | undefined, fairwayIds: number[]) {
  const filteredAreaOptions: AreaSelectOption[] = [];
  fairwayIds.forEach((f) => {
    areas
      ?.filter((item) => item.fairwayIds?.includes(f))
      .forEach((o) => {
        filteredAreaOptions.push(o);
      });
  });

  //Filter out duplicates - done in seperate line to avoid 4 nested Sonar warning
  return filteredAreaOptions.reduce(function (pre: AreaSelectOption[], cur: AreaSelectOption) {
    if (!pre.find((a) => a.id === cur.id)) {
      pre.push(cur);
    }
    return pre;
  }, []);
}
