import { CheckboxCustomEvent, IonCheckbox, IonItem, IonLabel, IonList, IonPopover } from '@ionic/react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { WarningArea, marineWarningAreasStructure } from '../../utils/constants';

interface CustomSelectDropdownProps {
  selected: string[];
  setSelected: (selected: string[]) => void;
}

interface SelectDropdownPopupProps {
  trigger: string;
  selected: string[];
  setSelected: (selected: string[]) => void;
  setExpanded: (expanded: boolean) => void;
  expanded: boolean;
}

interface CheckBoxItemsProps {
  items: WarningArea[];
  selected: string[];
  setSelected: (selected: string[]) => void;
  padding?: number;
  parent?: WarningArea;
}

const CheckBoxItems: React.FC<CheckBoxItemsProps> = ({ items, selected, setSelected, padding = 15, parent = undefined }) => {
  const { t } = useTranslation();

  const isOptionSelected = (value: string) => {
    if (value === undefined) {
      return false;
    }
    return selected.includes(value);
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

  const uncheckAllChildren = (value: string, updatedValues: string[]) => {
    const oldValues: string[] = [...updatedValues];
    const parentItem = items.find((p) => p.id === value);
    // get all children areas and children's children areas
    const childArray = parentItem?.childAreas?.flatMap((c) => {
      return c.childAreas ? [c.id.toString(), ...c.childAreas.map((area) => area.id.toString())] : [c.id.toString()];
    });
    const newArray = oldValues.filter((item) => !childArray?.includes(item));
    return newArray;
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
    } else if (!checked) {
      setSelected([...uncheckAllChildren(value, updatedValues)]);
      return;
    }
    setSelected([...updatedValues, ...childElements]);
  };

  return (
    <>
      {items.map((item) => {
        const optionSelected = isOptionSelected(item.id);
        return (
          <>
            <IonItem key={item.id} lines="none" style={{ '--padding-start': `${padding}px` }}>
              <IonCheckbox checked={optionSelected} value={item.id} justify="start" labelPlacement="end" onIonChange={handleCheckboxChange}>
                <IonLabel>{t(`areas.${item.id}`)}</IonLabel>
              </IonCheckbox>
            </IonItem>
            {item.childAreas && (
              <CheckBoxItems items={item.childAreas} selected={selected} setSelected={setSelected} padding={padding + 10} parent={item} />
            )}
          </>
        );
      })}
    </>
  );
};

const SelectDropdownPopup: React.FC<SelectDropdownPopupProps> = ({ trigger, selected, setSelected, setExpanded, expanded }) => {
  return (
    <>
      <IonPopover
        trigger={trigger}
        className="customPopover"
        isOpen={expanded}
        onDidDismiss={() => setExpanded(false)}
        showBackdrop={false}
        size="cover"
      >
        <IonList className="customPopover">
          <CheckBoxItems items={marineWarningAreasStructure} selected={selected} setSelected={setSelected} />
        </IonList>
      </IonPopover>
    </>
  );
};

const CustomSelectDropdown: React.FC<CustomSelectDropdownProps> = ({ selected, setSelected }) => {
  const { t } = useTranslation();

  const [expanded, setExpanded] = useState(false);
  const triggerId = 'popover-container';

  return (
    <>
      <IonItem id={triggerId} button={true} onClick={() => setExpanded(true)} className={'customSelect' + (expanded ? ' expanded' : '')}>
        <IonLabel>{t('common.filter')}</IonLabel>
        <SelectDropdownPopup trigger={triggerId} selected={selected} setSelected={setSelected} setExpanded={setExpanded} expanded={expanded} />
      </IonItem>
    </>
  );
};

export default CustomSelectDropdown;
