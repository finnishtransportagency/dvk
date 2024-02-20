import { CheckboxCustomEvent, IonCheckbox, IonContent, IonIcon, IonItem, IonLabel, IonList, IonPopover } from '@ionic/react';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { WarningFilter, marineWarningAreasStructure, marineWarningTypeStructure } from '../../utils/constants';
import { caretDownSharp, caretUpSharp } from 'ionicons/icons';
import { setNextFocusableElement } from '../../utils/customSelectDropdownUtils';

interface CustomSelectDropdownProps {
  triggerId: string;
  selected: string[];
  setSelected: (selected: string[]) => void;
}

interface SelectDropdownPopupProps {
  triggerRef: React.RefObject<HTMLIonItemElement>;
  trigger: string;
  selected: string[];
  setSelected: (selected: string[]) => void;
  setExpanded: (expanded: boolean) => void;
  expanded: boolean;
}

interface CheckBoxItemsProps {
  triggerRef: React.RefObject<HTMLIonItemElement>;
  popoverRef: React.RefObject<HTMLIonPopoverElement>;
  items: WarningFilter[];
  trigger: string;
  selected: string[];
  setSelected: (selected: string[]) => void;
  padding?: number;
  parent?: WarningFilter;
}

const CheckBoxItems: React.FC<CheckBoxItemsProps> = ({
  triggerRef,
  popoverRef,
  items,
  trigger,
  selected,
  setSelected,
  padding = 15,
  parent = undefined,
}) => {
  const { t } = useTranslation(undefined, { keyPrefix: `${trigger.includes('area') ? 'areas' : 'homePage.map.controls.layer'}` });

  const handleFocus = (e: KeyboardEvent | React.KeyboardEvent<HTMLIonCheckboxElement>) => {
    const isTabPressed = e.key === 'Tab';
    const isEnterPressed = e.key === 'Enter';

    if (trigger === 'popover-container-area') {
      // check if last element of the list, if structure changes these needs to be changed
      if ((document.activeElement?.getAttribute('value') === 'saimaaCanal' && isTabPressed) || isEnterPressed) {
        setNextFocusableElement(popoverRef, 'popover-container-type');
        e.preventDefault();
      }
    } else if (trigger === 'popover-container-type') {
      if ((document.activeElement?.getAttribute('value') === 'localWarning' && isTabPressed) || isEnterPressed) {
        setNextFocusableElement(popoverRef, 'warningFilterSortButton');
        e.preventDefault();
      }
    }
    if (isEnterPressed) {
      const checkbox = e.currentTarget as HTMLIonCheckboxElement;
      const customEvent = {
        bubbles: true,
        composed: true,
        target: e.currentTarget,
        detail: {
          checked: !checkbox.checked,
          value: checkbox.value,
        },
      } as CheckboxCustomEvent;
      handleCheckboxChange(customEvent);
    }
  };

  const isOptionSelected = (value: string) => {
    if (value === undefined) {
      return false;
    }
    return selected.includes(value);
  };

  const isIndeterminate = (area: WarningFilter) => {
    const values = area?.childAreas?.filter((a) => isOptionSelected(a.id)) ?? [];

    return values.length < (area?.childAreas?.length ?? 0) && values.length !== 0;
  };

  const checkAllChildren = (value: string) => {
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
  const checkIfUncheckParents = (newArray: string[]) => {
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

  const handleUncheck = (value: string, updatedValues: string[]) => {
    const oldValues: string[] = [...updatedValues];
    const parentItem = items.find((p) => p.id === value);
    // get all children areas and children's children areas
    const childArray = parentItem?.childAreas?.flatMap((c) => {
      return c.childAreas ? [c.id.toString(), ...c.childAreas.map((area) => area.id.toString())] : [c.id.toString()];
    });
    const newArray = oldValues.filter((item) => !childArray?.includes(item));
    const uncheckedParentsArray = checkIfUncheckParents(newArray);
    return uncheckedParentsArray;
  };

  const handleCheckboxChange = (event: CheckboxCustomEvent) => {
    const { checked, value } = event.detail;
    let childElements: string[] = [];
    let updatedValues = checked ? [...selected, value] : selected.filter((selectedId) => selectedId !== value);
    if (checked) {
      if (parent && !isOptionSelected(parent.id)) {
        // if there's parent and it's unchecked, check the parent box aswell
        updatedValues = [...updatedValues, parent.id, ...(parent.parent && !isOptionSelected(parent.parent) ? [parent.parent] : [])];
      }
      childElements = checkAllChildren(value);
      setSelected([...updatedValues, ...childElements]);
    } else if (!checked) {
      setSelected([...handleUncheck(value, updatedValues)]);
    }
    // forcing the popover to be under the box
    setTimeout(() => {
      const popoverElement = popoverRef.current?.shadowRoot?.childNodes[1].childNodes[1] as HTMLElement;
      const triggerElement = triggerRef.current?.getBoundingClientRect();

      popoverElement.style.top = (triggerElement?.top ?? 0) + (triggerElement?.height ?? 0) + 'px';
    }, 0);
  };

  return (
    <>
      {items.map((item) => {
        const optionSelected = isOptionSelected(item.id);
        const indeterminate = isIndeterminate(item);
        return (
          <React.Fragment key={item.id}>
            <IonItem key={item.id} lines="none" style={{ '--padding-start': `${padding}px` }}>
              <IonCheckbox
                id={item.id}
                aria-label={item.id}
                checked={optionSelected}
                indeterminate={indeterminate}
                value={item.id}
                justify="start"
                labelPlacement="end"
                onIonChange={handleCheckboxChange}
                onKeyDown={handleFocus}
              >
                <IonLabel>{t(`${item.id}`)}</IonLabel>
              </IonCheckbox>
            </IonItem>
            {item.childAreas && (
              <CheckBoxItems
                triggerRef={triggerRef}
                popoverRef={popoverRef}
                trigger={trigger}
                items={item.childAreas}
                selected={selected}
                setSelected={setSelected}
                padding={padding + 10}
                parent={item}
              />
            )}
          </React.Fragment>
        );
      })}
    </>
  );
};

const SelectDropdownPopup: React.FC<SelectDropdownPopupProps> = ({ triggerRef, trigger, selected, setSelected, setExpanded, expanded }) => {
  const items = trigger.includes('area') ? marineWarningAreasStructure : marineWarningTypeStructure;

  const popover = useRef<HTMLIonPopoverElement>(null);

  return (
    <IonPopover
      ref={popover}
      trigger={trigger}
      className={trigger.includes('area') ? 'customPopover tooLong' : 'customPopover'}
      isOpen={expanded}
      onDidDismiss={() => setExpanded(false)}
      showBackdrop={false}
      size="cover"
    >
      <IonContent>
        <IonList>
          <CheckBoxItems triggerRef={triggerRef} popoverRef={popover} items={items} trigger={trigger} selected={selected} setSelected={setSelected} />
        </IonList>
      </IonContent>
    </IonPopover>
  );
};

const CustomSelectDropdown: React.FC<CustomSelectDropdownProps> = ({ triggerId, selected, setSelected }) => {
  const { t } = useTranslation();
  // 3 different translations, so couldn't use functions own prefix setting
  const translationPrefix = triggerId.includes('area') ? 'areas' : 'homePage.map.controls.layer';

  const [expanded, setExpanded] = useState(false);

  const triggerRef = useRef<HTMLIonItemElement>(null);

  return (
    <IonItem
      ref={triggerRef}
      id={triggerId}
      button={true}
      onClick={() => setExpanded(true)}
      className={'customSelect' + (expanded ? ' expanded' : '')}
      lines="none"
    >
      {selected.length > 0 ? (
        <IonLabel>
          {selected.map((s, index) => {
            const label = t(translationPrefix + '.' + s);
            return index < selected.length - 1 ? label + ', ' : label;
          })}
        </IonLabel>
      ) : (
        <IonLabel className="halfOpacity">{t('common.filter')}</IonLabel>
      )}
      <IonIcon className="customSelectIcon" icon={expanded ? caretUpSharp : caretDownSharp} color={expanded ? 'primary' : 'medium'} />
      <SelectDropdownPopup
        triggerRef={triggerRef}
        trigger={triggerId}
        selected={selected}
        setSelected={setSelected}
        setExpanded={setExpanded}
        expanded={expanded}
      />
    </IonItem>
  );
};

export default CustomSelectDropdown;
