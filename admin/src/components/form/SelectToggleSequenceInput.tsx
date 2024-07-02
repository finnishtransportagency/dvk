import React, { useRef, useState } from 'react';
import { ActionType, SelectOption, ValueType } from '../../utils/constants';
import { IonIcon, IonItem, IonLabel } from '@ionic/react';
import { caretDownSharp, caretUpSharp } from 'ionicons/icons';
import SelectToggleSequenceDropdown from './SelectToggleSequenceDropdown';
import { LinkedFairwayInput } from '../../graphql/generated';

interface SelectToggleSequenceInputProps {
  options: SelectOption[];
  selected: LinkedFairwayInput[];
  setSelected: (value: ValueType, actionType: ActionType) => void;
  actionType: ActionType;
}

const SelectToggleSequenceInput: React.FC<SelectToggleSequenceInputProps> = ({ options, selected, setSelected, actionType }) => {
  const [expanded, setExpanded] = useState(false);

  const selectRef = useRef<HTMLIonItemElement>(null);
  const triggerId = 'select-with-toggle-sequence';

  const focusSelectItem = () => {
    selectRef.current?.click();
  };

  /*const getHelperText = () => {
    if (helperText) return helperText;
    return t('multiple-values-supported');
  };

  const getErrorText = () => {
    if (error) return error;
    if (!isValid) return t('required-field');
    return '';
  };

  const checkValidity = () => {
    setIsValid(required ? !error && selected.length > 0 : !error);
  };

  const labelText = constructSelectDropdownLabel(selected, options, lang, showId);*/

  const handleSelect = (updatedValues: LinkedFairwayInput[]) => {
    setSelected(updatedValues, actionType);
  };

  return (
    <div className="selectWrapper">
      <IonLabel className="formLabel" onClick={focusSelectItem}>
        {'LABEL'}
      </IonLabel>
      <IonItem
        ref={selectRef}
        id={triggerId}
        button={true}
        className={'selectInput' + (expanded ? ' select-expanded' : '')}
        detail={false}
        lines="none"
        onClick={() => setExpanded(!expanded)}
        onBlur={() => setExpanded(false)}
      >
        <IonIcon icon={expanded ? caretUpSharp : caretDownSharp} aria-hidden={true} className="select-icon" color={expanded ? 'primary' : 'medium'} />
      </IonItem>
      <SelectToggleSequenceDropdown
        options={options}
        setExpanded={setExpanded}
        trigger={triggerId}
        triggerRef={selectRef}
        selected={selected}
        setSelected={handleSelect}
      />
    </div>
  );
};

export default SelectToggleSequenceInput;
