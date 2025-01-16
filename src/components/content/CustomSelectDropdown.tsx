import { CheckboxCustomEvent, IonCheckbox, IonContent, IonIcon, IonItem, IonLabel, IonList, IonPopover } from '@ionic/react';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  WarningFilter,
  marineWarningAreasStructure,
  marineWarningTypeStructure,
  equipmentAreasStructure,
  SafetyEquipmentFaultFilter,
} from '../../utils/constants';
import { caretDownSharp, caretUpSharp } from 'ionicons/icons';
import { setNextFocusableElement, isOptionSelected, isIndeterminate, checkAllChildren, handleUncheck } from '../../utils/customSelectDropdownUtils';

interface CustomSelectDropdownProps {
  triggerId: string;
  selected: string[];
  setSelected: (selected: string[]) => void;
}

interface SelectDropdownPopupProps {
  triggerRef: React.RefObject<HTMLIonItemElement | null>;
  trigger: string;
  selected: string[];
  setSelected: (selected: string[]) => void;
  setExpanded: (expanded: boolean) => void;
  expanded: boolean;
}

interface CheckBoxItemsProps {
  triggerRef: React.RefObject<HTMLIonItemElement | null>;
  popoverRef: React.RefObject<HTMLIonPopoverElement | null>;
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
  const { t } = useTranslation(undefined, { keyPrefix: `${trigger.toLocaleLowerCase().includes('area') ? 'areas' : 'homePage.map.controls.layer'}` });

  const handleFocus = (e: KeyboardEvent | React.KeyboardEvent<HTMLIonCheckboxElement>) => {
    const isTabPressed = e.key === 'Tab';
    const isEnterPressed = e.key === 'Enter';

    setNextFocusableElement(popoverRef, trigger, isTabPressed, isEnterPressed);

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

  const handleCheckboxChange = (event: CheckboxCustomEvent) => {
    const { checked, value } = event.detail;
    let childElements: string[] = [];
    let updatedValues = checked ? [...selected, value] : selected.filter((selectedId) => selectedId !== value);
    if (checked) {
      if (parent && !isOptionSelected(selected, parent.id)) {
        // if there's parent and it's unchecked, check the parent box aswell
        updatedValues = [...updatedValues, parent.id, ...(parent.parent && !isOptionSelected(selected, parent.parent) ? [parent.parent] : [])];
      }
      childElements = checkAllChildren(items, selected, value);
      setSelected([...updatedValues, ...childElements]);
    } else if (!checked) {
      setSelected([...handleUncheck(value, updatedValues, items, parent)]);
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
        const optionSelected = isOptionSelected(selected, item.id);
        const indeterminate = isIndeterminate(selected, item);
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
  let items: WarningFilter[] | SafetyEquipmentFaultFilter[];

  switch (true) {
    case trigger.includes('equipment-area'):
      items = equipmentAreasStructure;
      break;
    case trigger.includes('area'):
      items = marineWarningAreasStructure;
      break;
    case trigger.includes('type'):
      items = marineWarningTypeStructure;
      break;
    default:
      // Handle the case when none of the conditions match
      items = [];
  }

  const popover = useRef<HTMLIonPopoverElement>(null);

  return (
    <IonPopover
      ref={popover}
      trigger={trigger}
      className={trigger.includes('container-area') ? 'customPopover tooLong' : 'customPopover'}
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
  const translationPrefix = triggerId.toLocaleLowerCase().includes('area') ? 'areas' : 'homePage.map.controls.layer';
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
