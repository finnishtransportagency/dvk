import React, { useRef, useState } from 'react';
import { Lang, SelectOption } from '../../utils/constants';
import { IonButton, IonItem, IonLabel, IonList, IonPopover } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { constructSelectOptionLabel } from '../../utils/common';
import './SelectToggleSequenceInput.css';

interface SelectToggleSequenceDropdownProps {
  options: SelectOption[] | null;
  selected: number[];
  setSelected: (selected: number[]) => void;
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

  const [sequence, setSequence] = useState(false);

  const popover = useRef<HTMLIonPopoverElement>(null);

  const isOptionSelected = (value: SelectOption) => {
    if (value === undefined) {
      return false;
    }
    return typeof value.id === 'number' && selected.includes(value.id);
  };

  const handlePopupOpen = () => {
    console.log(triggerRef);
    setExpanded(true);
  };

  const handleChange = (id: number) => {
    console.log(setSelected);
    console.log(setSequence);
    console.log(id);
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
                  handleChange(option.id as number);
                }}
              >
                <IonButton
                  slot="start"
                  onClick={(ev) => {
                    ev.preventDefault();
                    ev.stopPropagation();
                  }}
                  fill="clear"
                  className={'icon-only sequenceButton ' + (sequence ? 'selected' : '')}
                >
                  {sequence ? '1' : ''}
                </IonButton>
                <IonLabel color={sequence ? 'primary' : 'dark'}>{optionLabel}</IonLabel>
              </IonItem>
            </div>
          );
        })}
      </IonList>
    </IonPopover>
  );
};

export default SelectToggleSequenceDropdown;
