import React, { useRef } from 'react';
import { Lang, SelectOption } from '../../utils/constants';
import { IonButton, IonItem, IonLabel, IonList, IonPopover } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { addSequence, constructSelectOptionLabel, removeSequence } from '../../utils/common';
import './SelectToggleSequenceDropdown.css';
import { SelectedFairwayInput } from '../../graphql/generated';

interface SelectToggleSequenceDropdownProps {
  options: SelectOption[] | null;
  selected: SelectedFairwayInput[];
  setSelected: (selected: SelectedFairwayInput[]) => void;
  setExpanded: (expanded: boolean) => void;
  checkValidity: () => void;
  trigger: string;
  triggerRef: React.RefObject<HTMLIonItemElement>;
  showId?: boolean;
}

const SelectToggleSequenceDropdown: React.FC<SelectToggleSequenceDropdownProps> = ({
  options,
  selected,
  setSelected,
  setExpanded,
  trigger,
  triggerRef,
  checkValidity,
  showId,
}) => {
  const { i18n } = useTranslation(undefined, { keyPrefix: 'general' });
  const lang = i18n.resolvedLanguage as Lang;

  const popover = useRef<HTMLIonPopoverElement>(null);

  const sortedOptions = options?.sort((a, b) => (a.id as number) - (b.id as number)) as SelectOption[];

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

    // Set popover position by force based on mocked select field dimensions
    setTimeout(() => {
      (popover.current?.shadowRoot?.childNodes[1].childNodes[0] as HTMLElement).style.top =
        (triggerRef.current?.getBoundingClientRect().top ?? 0) + (triggerRef.current?.getBoundingClientRect().height ?? 0) + 'px';
    }, 0);
  };

  const handlePopupOpen = () => {
    setExpanded(true);
  };

  const handlePopupClose = () => {
    setExpanded(false);
    checkValidity();
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
      <IonList className="ion-no-padding sequenceList">
        {sortedOptions?.map((option) => {
          const optionSelected = isOptionSelected(option);
          const optionLabel = constructSelectOptionLabel(option, lang, showId);
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
