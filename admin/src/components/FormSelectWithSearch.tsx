import React, { useEffect, useRef, useState } from 'react';
import { IonIcon, IonItem, IonLabel, IonNote, IonSkeletonText } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { ActionType, Lang, SelectOption, ValueType } from '../utils/constants';
import { constructSelectDropdownLabel, getCombinedErrorAndHelperText, sortTypeSafeSelectOptions } from '../utils/common';
import { caretDownSharp, caretUpSharp } from 'ionicons/icons';
import DropdownPopup from './DropdownPopup';

interface SelectWithSearchProps {
  label: string;
  options: SelectOption[] | null;
  selected: number[];
  setSelected: (value: ValueType, actionType: ActionType) => void;
  actionType: ActionType;
  required?: boolean;
  showId?: boolean;
  disabled?: boolean;
  helperText?: string | null;
  error?: string;
  isLoading?: boolean;
}

const FormSelectWithSearch: React.FC<SelectWithSearchProps> = ({
  label,
  options,
  selected,
  setSelected,
  actionType,
  required,
  showId,
  disabled,
  helperText,
  error,
  isLoading,
}) => {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'general' });
  const lang = i18n.resolvedLanguage as Lang;

  const [filteredItems, setFilteredItems] = useState<SelectOption[]>([]);
  const [isValid, setIsValid] = useState(error ? false : true);
  const [expanded, setIsExpanded] = useState(false);

  const selectRef = useRef<HTMLIonLabelElement>(null);

  const focusSelectItem = () => {
    selectRef.current?.click();
  };

  const getHelperText = () => {
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

  const handleSelect = (updatedValues: number[]) => {
    setSelected(updatedValues, actionType);
  };

  useEffect(() => {
    if (options && options.length > 0) {
      const sortedOptions = sortTypeSafeSelectOptions(options, lang);
      setFilteredItems(sortedOptions);
    }
  }, [options, lang]);

  return (
    <div className={'selectWrapper' + (isValid && (!error || error === '') ? '' : ' invalid') + (disabled ? ' disabled' : '')}>
      <IonLabel className={'formLabel' + (disabled ? ' disabled' : '')} onClick={focusSelectItem}>
        {label} {required ? '*' : ''}
      </IonLabel>
      {isLoading ? (
        <IonSkeletonText animated={true} className="select-skeleton" />
      ) : (
        <>
          <IonItem
            id="select-with-search"
            button={true}
            className={'custom-select-container' + (expanded ? ' expanded' : '')}
            detail={false}
            disabled={isLoading || disabled}
            lines="none"
          >
            <IonItem className={'custom-select-item' + (expanded ? ' expanded' : '')} detail={false} disabled={isLoading || disabled} lines="none">
              <IonLabel ref={selectRef} className="ion-text-wrap" color={selected.length > 0 ? 'dark' : 'medium'}>
                {selected.length > 0 ? constructSelectDropdownLabel(selected, options, lang, showId) : t('choose') ?? ''}
              </IonLabel>
              <IonIcon
                icon={expanded ? caretUpSharp : caretDownSharp}
                aria-hidden={true}
                className="custom-select-icon"
                color={expanded ? 'primary' : 'medium'}
              />
            </IonItem>
          </IonItem>
          {isValid && (!error || error === '') && getHelperText() && <IonNote className="helper">{getHelperText()}</IonNote>}
          <IonNote className="input-error">{getCombinedErrorAndHelperText(getHelperText(), getErrorText())}</IonNote>
          <DropdownPopup
            trigger="select-with-search"
            options={options}
            selected={selected}
            setSelected={handleSelect}
            filteredItems={filteredItems}
            setFilteredItems={setFilteredItems}
            setIsExpanded={setIsExpanded}
            checkValidity={checkValidity}
            showId={showId}
          />
        </>
      )}
    </div>
  );
};

export default FormSelectWithSearch;
