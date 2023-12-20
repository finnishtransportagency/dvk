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
}

const CheckBoxItems: React.FC<CheckBoxItemsProps> = ({ items, selected, setSelected, padding = 15 }) => {
  const { t } = useTranslation();

  const isOptionSelected = (value: string) => {
    if (value === undefined) {
      return false;
    }
    return selected.includes(value);
  };

  const handleCheckboxChange = (event: CheckboxCustomEvent) => {
    const { checked, value } = event.detail;
    const updatedValues = checked ? [...selected, value] : selected.filter((selectedId) => selectedId !== value);
    setSelected(updatedValues);
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
            {item.childAreas && <CheckBoxItems items={item.childAreas} selected={selected} setSelected={setSelected} padding={padding + 10} />}
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
