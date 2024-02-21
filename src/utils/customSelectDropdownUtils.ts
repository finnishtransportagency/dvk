import { WarningFilter, marineWarningAreasStructure } from './constants';

export function setNextFocusableElement(popoverRef: React.RefObject<HTMLIonPopoverElement>, focusableElementId: string) {
  popoverRef?.current?.dismiss().then(() => {
    const focusable = document.getElementById(focusableElementId);

    focusable?.setAttribute('tabIndex', '-1');
    focusable?.focus({ preventScroll: false });
    focusable?.setAttribute('tabIndex', '0');
  });
}

export const isOptionSelected = (selected: string[], value: string) => {
  if (value === undefined) {
    return false;
  }
  return selected.includes(value);
};

export const isIndeterminate = (selected: string[], area: WarningFilter) => {
  const values = area?.childAreas?.filter((a) => isOptionSelected(selected, a.id)) ?? [];

  return values.length < (area?.childAreas?.length ?? 0) && values.length !== 0;
};

export const checkAllChildren = (items: WarningFilter[], selected: string[], value: string) => {
  const array: string[] = [];
  const parentItem = items.find((p) => p.id === value);
  parentItem?.childAreas?.map((c) => {
    if (!selected.includes(c.id)) {
      array.push(c.id);
      // Check child's children. Not the most elegant solution.
      c.childAreas?.map((c2) => {
        if (!selected.includes(c2.id)) {
          array.push(c2.id);
        }
      });
    }
  });
  return array;
};

// function for unchecking parents and parent's parent checkbox
const checkIfUncheckParents = (newArray: string[], parent: WarningFilter | undefined) => {
  const array: string[] = [];
  // notice ! front of parent
  const noChildrenChecked = !parent?.childAreas?.some((a) => newArray.includes(a.id));
  if (noChildrenChecked) {
    const removedParentArray = newArray.filter((i) => i !== parent?.id);
    if (parent?.parent) {
      // check if parent's parent has children checked, if has, then no unchecking
      // atm this clause only used in warning areas, so hard coded structure. If needed in future for other use -> refactor
      const noGrandParentsChildrenChecked = !marineWarningAreasStructure[0]?.childAreas?.some((a) => removedParentArray.includes(a.id));
      array.push(...(noGrandParentsChildrenChecked ? removedParentArray.filter((i) => i !== parent.parent) : removedParentArray));
    } else {
      array.push(...removedParentArray);
    }
  }
  return noChildrenChecked ? array : newArray;
};

export const handleUncheck = (value: string, updatedValues: string[], items: WarningFilter[], parent: WarningFilter | undefined) => {
  const oldValues: string[] = [...updatedValues];
  const parentItem = items.find((p) => p.id === value);
  // get all children areas and children's children areas
  const childArray = parentItem?.childAreas?.flatMap((c) => {
    return c.childAreas ? [c.id.toString(), ...c.childAreas.map((area) => area.id.toString())] : [c.id.toString()];
  });
  const newArray = oldValues.filter((item) => !childArray?.includes(item));
  const uncheckedParentsArray = checkIfUncheckParents(newArray, parent);
  return uncheckedParentsArray;
};
