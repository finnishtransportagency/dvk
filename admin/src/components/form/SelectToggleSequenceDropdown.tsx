import React, { useRef } from 'react';
import { Lang, SelectOption } from '../../utils/constants';
import { IonButton, IonItem, IonLabel, IonList, IonPopover } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { constructSelectOptionLabel } from '../../utils/common';
import './SelectToggleSequenceInput.css';
import { LinkedFairwayInput } from '../../graphql/generated';

interface SelectToggleSequenceDropdownProps {
  options: SelectOption[] | null;
  selected: LinkedFairwayInput[];
  setSelected: (selected: LinkedFairwayInput[]) => void;
  setExpanded: (expanded: boolean) => void;
  trigger: string;
  triggerRef: React.RefObject<HTMLIonItemElement>;
}

const SelectToggleSequenceDropdown: React.FC<SelectToggleSequenceDropdownProps> = ({
  options,
  selected,
  setSelected,
  setExpanded,
  trigger,
  triggerRef,
}) => {
  const { i18n } = useTranslation(undefined, { keyPrefix: 'general' });
  const lang = i18n.resolvedLanguage as Lang;

  const popover = useRef<HTMLIonPopoverElement>(null);

  const isOptionSelected = (value: SelectOption) => {
    if (value === undefined) {
      return false;
    }
    return typeof value.id === 'number' && selected.some((s) => s.id === value.id);
  };

  const handlePopupOpen = () => {
    console.log(triggerRef);
    setExpanded(true);
  };

  const handleChange = (id: number, optionSelected: boolean) => {
    const updatedValues = optionSelected ? selected.filter((s) => s.id !== id) : [...selected, { id: id, sequenceNumber: 1 }];
    setSelected(updatedValues);
  };

  const handlePopupClose = () => {
    setExpanded(false);
  };

  return (
    <IonPopover
      ref={popover}
      trigger={trigger}
      className={'multiSelect'}
      showBackdrop={false}
      size="cover"
      dismissOnSelect={false}
      arrow={false}
      onDidPresent={handlePopupOpen}
      onDidDismiss={handlePopupClose}
    >
      <IonList className="ion-no-padding">
        {options?.map((option) => {
          const optionSelected = isOptionSelected(option);
          const optionLabel = constructSelectOptionLabel(option, lang, true);
          return (
            <div key={option.id as number} className="selectToggleSequenceItem">
              <IonItem
                button
                key={option.id.toString()}
                className={optionSelected ? 'option-selected' : ''}
                lines="none"
                onClick={() => {
                  handleChange(option.id as number, optionSelected);
                }}
              >
                <IonButton
                  slot="start"
                  onClick={(ev) => {
                    ev.preventDefault();
                    ev.stopPropagation();
                  }}
                  fill="clear"
                  className={'icon-only sequenceButton ' + (optionSelected ? 'selected' : '')}
                >
                  {optionSelected ? '1' : ''}
                </IonButton>
                <IonLabel color={optionSelected ? 'primary' : 'dark'}>{optionLabel}</IonLabel>
              </IonItem>
            </div>
          );
        })}
      </IonList>
    </IonPopover>
  );
};

export default SelectToggleSequenceDropdown;
