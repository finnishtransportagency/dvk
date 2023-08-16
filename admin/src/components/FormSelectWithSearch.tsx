import React, { useRef, useState } from 'react';
import { IonIcon, IonItem, IonLabel, IonNote, IonSkeletonText } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { ActionType, Lang, SelectOption, ValueType } from '../utils/constants';
import { constructSelectDropdownLabel, getCombinedErrorAndHelperText } from '../utils/common';
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

  const [isValid, setIsValid] = useState(error ? false : true);
  const [expanded, setIsExpanded] = useState(false);

  const itemRef = useRef<HTMLIonItemElement>(null);
  const selectRef = useRef<HTMLIonLabelElement>(null);
  const triggerId = 'select-with-search-' + actionType;

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

  return (
    <div className={'selectWrapper' + (isValid && (!error || error === '') ? '' : ' invalid') + (disabled ? ' disabled' : '')}>
      <IonLabel className={'formLabel' + (disabled ? ' disabled' : '')} onClick={disabled ? undefined : focusSelectItem}>
        {label} {required ? '*' : ''}
      </IonLabel>
      {isLoading ? (
        <IonSkeletonText animated={true} className="select-skeleton" />
      ) : (
        <>
          <IonItem
            ref={itemRef}
            id={triggerId}
            button={true}
            className={'custom-select-container' + (expanded ? ' expanded' : '')}
            detail={false}
            disabled={disabled}
            lines="none"
            onClick={() => setIsExpanded(true)}
          >
            <IonItem className={'custom-select-item' + (expanded ? ' expanded' : '')} detail={false} disabled={disabled} lines="none">
              <IonLabel ref={selectRef} className="ion-text-wrap" color={selected.length > 0 ? 'dark' : 'medium'}>
                {(selected.length > 0 && (
                  <ul>
                    {constructSelectDropdownLabel(selected, options, lang, showId).map((opt) => {
                      return <li key={opt}>{opt}</li>;
                    })}
                  </ul>
                )) ||
                  t('choose')}
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
            trigger={triggerId}
            triggerRef={itemRef}
            options={options}
            selected={selected}
            setSelected={handleSelect}
            setIsExpanded={setIsExpanded}
            checkValidity={checkValidity}
            showId={showId}
            className={'custom-select-popover ' + actionType}
          />
        </>
      )}
    </div>
  );
};

export default FormSelectWithSearch;
