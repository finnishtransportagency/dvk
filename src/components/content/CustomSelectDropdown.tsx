import { CheckboxCustomEvent, IonCheckbox, IonContent, IonIcon, IonItem, IonLabel, IonList, IonPopover } from '@ionic/react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { WarningFilter, marineWarningAreasStructure, marineWarningTypeStructure } from '../../utils/constants';
import { caretDownSharp, caretUpSharp } from 'ionicons/icons';

interface CustomSelectDropdownProps {
  triggerId: string;
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
  items: WarningFilter[];
  trigger: string;
  selected: string[];
  setSelected: (selected: string[]) => void;
  padding?: number;
  parent?: WarningFilter;
}

const CheckBoxItems: React.FC<CheckBoxItemsProps> = ({ items, trigger, selected, setSelected, padding = 15, parent = undefined }) => {
  const { t } = useTranslation(undefined, { keyPrefix: `${trigger.includes('area') ? 'areas' : 'homePage.map.controls.layer'}` });

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
          <React.Fragment key={item.id}>
            <IonItem key={item.id} lines="none" style={{ '--padding-start': `${padding}px` }}>
              <IonCheckbox checked={optionSelected} value={item.id} justify="start" labelPlacement="end" onIonChange={handleCheckboxChange}>
                <IonLabel className="optionLabel">{t(`${item.id}`)}</IonLabel>
              </IonCheckbox>
            </IonItem>
            {item.childAreas && (
              <CheckBoxItems
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

const SelectDropdownPopup: React.FC<SelectDropdownPopupProps> = ({ trigger, selected, setSelected, setExpanded, expanded }) => {
  const items = trigger.includes('area') ? marineWarningAreasStructure : marineWarningTypeStructure;
  return (
    <IonPopover
      trigger={trigger}
      className="customPopover"
      isOpen={expanded}
      onDidDismiss={() => setExpanded(false)}
      showBackdrop={false}
      size="cover"
    >
      <IonContent>
        <IonList>
          <CheckBoxItems items={items} trigger={trigger} selected={selected} setSelected={setSelected} />
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

  return (
    <IonItem id={triggerId} button={true} onClick={() => setExpanded(true)} className={'customSelect' + (expanded ? ' expanded' : '')}>
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
      <SelectDropdownPopup trigger={triggerId} selected={selected} setSelected={setSelected} setExpanded={setExpanded} expanded={expanded} />
    </IonItem>
  );
};

export default CustomSelectDropdown;
