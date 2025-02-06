import { TFunction } from 'i18next';
import { SquatCalculation, SquatCalculationInput } from '../graphql/generated';
import { sortAreaSelectOptions } from './common';
import { AreaSelectOption } from './constants';

export const getOrphanedAreaString = (squatCalculations: SquatCalculation[], areaIds: number[], t: TFunction) => {
  if (hasFairwayCardGotAnyOrphanedAreaIds(squatCalculations, areaIds)) {
    return t('orphanedAreas');
  }
  return '';
};

function hasFairwayCardGotAnyOrphanedAreaIds(squatCalculations: SquatCalculation[], areas: number[]) {
  //for each squat calc
  if ((areas ?? []).length === 0 || (squatCalculations ?? []).length === 0) {
    return false;
  }
  let foundOrphan = false;
  squatCalculations?.forEach((calc) => {
    if (!foundOrphan && hasSquatCalculationGotAnyOrphanedAreaIds(calc?.suitableFairwayAreas as number[], areas ?? [])) {
      foundOrphan = true;
    }
  });
  return foundOrphan;
}

function hasSquatCalculationGotAnyOrphanedAreaIds(suitableFairwayAreas: number[], areas: number[]) {
  let foundOrphan = false;
  suitableFairwayAreas.forEach((squatAreaId) => {
    if (!foundOrphan && !areas.some((a) => a === squatAreaId)) {
      foundOrphan = true;
    }
  });
  return foundOrphan;
}

export function getOrphanedAreaIdsFromSquatSection(squatSections: SquatCalculationInput[], areas: AreaSelectOption[]): number[] {
  const allOrphanedIds: number[] = [];
  squatSections.forEach((s) => {
    getOrphanedAreaIdsFromSquatCalculationInput(s, areas).forEach((id) => {
      if (!allOrphanedIds.includes(id)) {
        allOrphanedIds.push(id);
      }
    });
  });
  return allOrphanedIds;
}

export function getOrphanedAreaIdsFromSquatCalculationInput(squatSection: SquatCalculationInput, areas: AreaSelectOption[]): number[] {
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
