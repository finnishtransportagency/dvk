import React, { useRef } from 'react';
import { Lang, SelectOption } from '../../utils/constants';
import { IonButton, IonItem, IonLabel, IonList, IonPopover } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { addSequence, constructSelectOptionLabel, removeSequence } from '../../utils/common';
import './SelectToggleSequenceInput.css';
import { SelectedFairwayInput } from '../../graphql/generated';

interface SelectToggleSequenceDropdownProps {
  options: SelectOption[] | null;
  selected: SelectedFairwayInput[];
  setSelected: (selected: SelectedFairwayInput[]) => void;
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
    return typeof value.id === 'number' && selected.some((fairway) => fairway.id === value.id);
  };

  const getSequenceNumber = (id: number) => {
    return selected.find((s) => s.id === id)?.sequenceNumber;
  };

  const toggleSequence = (optionId: number, currentSequenceNumber: number, optionSelected: boolean) => {
    const linkedFairway = { id: optionId, sequenceNumber: currentSequenceNumber } as SelectedFairwayInput;
    const updatedValues = optionSelected ? selected.filter((fairway) => fairway.id !== optionId) : [...selected, linkedFairway];
    const newSequencedSelected = linkedFairway.sequenceNumber
      ? removeSequence(linkedFairway, updatedValues, currentSequenceNumber)
      : addSequence(linkedFairway, updatedValues);
    setSelected([...newSequencedSelected] as SelectedFairwayInput[]);
  };

  const handlePopupOpen = () => {
    console.log(triggerRef);
    setExpanded(true);
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
          const currentSequenceNumber = getSequenceNumber(option.id as number);
          return (
            <div key={option.id as number} className="selectToggleSequenceItem">
              <IonItem
                button
                key={option.id.toString()}
                className={optionSelected ? 'option-selected' : ''}
                lines="none"
                onClick={() => {
                  toggleSequence(option.id as number, currentSequenceNumber as number, optionSelected);
                }}
              >
                <IonButton
                  slot="start"
                  onClick={(ev) => {
                    ev.preventDefault();
                    ev.stopPropagation();
                    toggleSequence(option.id as number, currentSequenceNumber as number, optionSelected);
                  }}
                  fill="clear"
                  className={'icon-only sequenceButton ' + (optionSelected ? 'selected' : '')}
                >
                  {optionSelected ? currentSequenceNumber : ''}
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
