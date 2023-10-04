import React, { forwardRef, useRef, useState } from 'react';
import { IonIcon, IonItem, IonLabel, IonNote, IonSkeletonText } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { ActionType, Lang, SelectOption, ValueType } from '../utils/constants';
import { constructSelectDropdownLabel, getCombinedErrorAndHelperText, isInputOk } from '../utils/common';
import { caretDownSharp, caretUpSharp } from 'ionicons/icons';
import DropdownPopup from './DropdownPopup';

interface SelectItemProps {
  selected: number[];
  label: string[];
  expanded: boolean;
  disabled?: boolean;
}

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

const SelectItem = forwardRef(function SelectItem(props: SelectItemProps, ref: React.ForwardedRef<HTMLIonLabelElement>) {
  const { t } = useTranslation(undefined, { keyPrefix: 'general' });

  return (
    <IonItem className={'custom-select-item' + (props.expanded ? ' expanded' : '')} detail={false} disabled={props.disabled} lines="none">
      {props.selected.length > 0 ? (
        <IonLabel ref={ref} className="ion-text-wrap" color="dark">
          <ul>
            {props.label.map((opt) => {
              return <li key={opt}>{opt}</li>;
            })}
          </ul>
        </IonLabel>
      ) : (
        <IonLabel ref={ref} className="ion-text-wrap" color="medium">
          {t('choose')}
        </IonLabel>
      )}
      <IonIcon
        icon={props.expanded ? caretUpSharp : caretDownSharp}
        aria-hidden={true}
        className="custom-select-icon"
        color={props.expanded ? 'primary' : 'medium'}
      />
    </IonItem>
  );
});

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

  const [isValid, setIsValid] = useState(!error);
  const [expanded, setIsExpanded] = useState(false);

  const containerRef = useRef<HTMLIonItemElement>(null);
  const selectLabelRef = useRef<HTMLIonLabelElement>(null);
  const triggerId = 'select-with-search-' + actionType;

  const focusSelectItem = () => {
    selectLabelRef.current?.click();
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
    <div className={'selectWrapper' + (isInputOk(isValid, error) ? '' : ' invalid') + (disabled ? ' disabled' : '')}>
      <IonLabel className={'formLabel' + (disabled ? ' disabled' : '')} onClick={disabled ? undefined : focusSelectItem}>
        {label} {required ? '*' : ''}
      </IonLabel>
      {isLoading ? (
        <IonSkeletonText animated={true} className="select-skeleton" />
      ) : (
        <>
          <IonItem
            ref={containerRef}
            id={triggerId}
            button={true}
            className={'custom-select-container' + (expanded ? ' expanded' : '')}
            detail={false}
            disabled={disabled}
            lines="none"
            onClick={() => setIsExpanded(true)}
            onBlur={() => checkValidity()}
          >
            <SelectItem
              ref={selectLabelRef}
              selected={selected}
              label={constructSelectDropdownLabel(selected, options, lang, showId)}
              expanded={expanded}
              disabled={disabled}
            />
          </IonItem>
          {isInputOk(isValid, error) && getHelperText() && <IonNote className="helper">{getHelperText()}</IonNote>}
          <IonNote className="input-error">{getCombinedErrorAndHelperText(getHelperText(), getErrorText())}</IonNote>
          <DropdownPopup
            trigger={triggerId}
            triggerRef={containerRef}
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
