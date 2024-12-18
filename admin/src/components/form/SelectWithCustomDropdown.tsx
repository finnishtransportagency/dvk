import React, { useRef, useState } from 'react';
import { IonButton, IonIcon, IonItem, IonLabel, IonNote, IonSkeletonText, IonText } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { ActionType, DropdownType, Lang, SelectOption, ValueType } from '../../utils/constants';
import { constructSelectDropdownLabel, getCombinedErrorAndHelperText, isInputOk } from '../../utils/common';
import { caretDownSharp, caretUpSharp } from 'ionicons/icons';
import SelectDropdownPopup from './SelectDropdownPopup';
import { SelectedFairwayInput } from '../../graphql/generated';
import SelectToggleSequenceDropdown from './SelectToggleSequenceDropdown';
import HelpIcon from '../../theme/img/help_icon.svg?react';
import NotificationModal from '../NotificationModal';
import Textarea from './Textarea';

interface SelectWithCustomDropdownProps {
  label: string;
  options: SelectOption[] | null;
  selected: number[] | SelectedFairwayInput[];
  setSelected: (value: ValueType, actionType: ActionType) => void;
  actionType: ActionType;
  dropdownType: DropdownType;
  required?: boolean;
  showId?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  helperText?: string | null;
  error?: string;
  isLoading?: boolean;
  infoTitle?: string;
  infoDescription?: string;
}

const SelectWithCustomDropdown: React.FC<SelectWithCustomDropdownProps> = ({
  label,
  options,
  selected,
  setSelected,
  actionType,
  dropdownType,
  required,
  showId,
  disabled,
  readonly = false,
  helperText,
  error,
  isLoading,
  infoTitle,
  infoDescription,
}) => {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'general' });
  const lang = i18n.resolvedLanguage as Lang;

  const [isValid, setIsValid] = useState(!error);
  const [expanded, setExpanded] = useState(false);
  const [infoModalOpen, setInfoModalOpen] = useState<boolean>(false);

  const selectRef = useRef<HTMLIonItemElement>(null);
  const triggerId = 'select-with-dropdown-' + actionType;

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

  const handleSelect = (updatedValues: number[] | SelectedFairwayInput[]) => {
    setSelected(updatedValues, actionType);
  };

  const showInfoModal = () => {
    setInfoModalOpen(true);
  };

  const labelText = constructSelectDropdownLabel(dropdownType === 'sequence' ? selected : (selected as number[]), options, lang, showId);
  const disabledStyle = disabled ? ' disabled' : '';
  const inputClassName = 'selectWrapper' + (isInputOk(isValid, error) ? '' : ' invalid' + disabledStyle);

  //For readability of tsx
  const readonlyAndNotLoading = readonly && !isLoading;
  const inputOrLoading = !readonlyAndNotLoading;

  return (
    <div className={inputClassName}>
      {readonlyAndNotLoading && (
        <>
          <Textarea
            readonly={readonly}
            label={label}
            setValue={() => {}}
            actionType="empty"
            val={labelText.join('\r')}
            rows={labelText.length}
            required={required}
          />
          <IonNote className="helper">{getHelperText()}</IonNote>
        </>
      )}
      {inputOrLoading && (
        <>
          <IonLabel className={'formLabel' + (!readonly && disabled ? ' disabled' : '')}>
            <IonText onClick={disabled || readonly ? undefined : focusSelectItem}>
              {label} {required ? '*' : ''}
            </IonText>
            {infoTitle && infoDescription && (
              <IonButton
                fill="clear"
                className="icon-only xx-small labelButton"
                onClick={() => showInfoModal()}
                title={t('info') ?? ''}
                aria-label={t('info') ?? ''}
              >
                <HelpIcon />
              </IonButton>
            )}
          </IonLabel>
          {isLoading ? (
            <IonSkeletonText animated={true} className="select-skeleton" />
          ) : (
            <>
              <IonItem
                ref={selectRef}
                id={triggerId}
                button={true}
                className={'selectInput' + (expanded ? ' select-expanded' : '')}
                detail={false}
                disabled={disabled}
                lines="none"
                onClick={() => setExpanded(true)}
                onBlur={() => checkValidity()}
              >
                {selected.length > 0 ? (
                  <IonLabel className="ion-text-wrap" color="dark">
                    <ul>
                      {labelText.map((opt) => {
                        return <li key={opt}>{opt}</li>;
                      })}
                    </ul>
                  </IonLabel>
                ) : (
                  <IonLabel className="ion-text-wrap" color="medium">
                    {t('choose')}
                  </IonLabel>
                )}
                <IonIcon
                  icon={expanded ? caretUpSharp : caretDownSharp}
                  aria-hidden={true}
                  className="select-icon"
                  color={expanded ? 'primary' : 'medium'}
                />
              </IonItem>
              {isInputOk(isValid, error) && getHelperText() && <IonNote className="helper">{getHelperText()}</IonNote>}
              <IonNote className="input-error">{getCombinedErrorAndHelperText(getHelperText(), getErrorText())}</IonNote>
              {dropdownType === 'filter' && (
                <SelectDropdownPopup
                  trigger={triggerId}
                  triggerRef={selectRef}
                  options={options}
                  selected={selected as number[]}
                  setSelected={handleSelect}
                  setIsExpanded={setExpanded}
                  checkValidity={checkValidity}
                  showId={showId}
                  className={actionType}
                />
              )}
              {dropdownType === 'sequence' && (
                <SelectToggleSequenceDropdown
                  options={options}
                  selected={selected as SelectedFairwayInput[]}
                  setSelected={handleSelect}
                  setExpanded={setExpanded}
                  checkValidity={checkValidity}
                  trigger={triggerId}
                  triggerRef={selectRef}
                  showId={showId}
                />
              )}
              <NotificationModal
                isOpen={infoModalOpen}
                closeAction={() => setInfoModalOpen(false)}
                closeTitle={t('close')}
                header={infoTitle ?? ''}
                i18nkey={infoDescription}
              />
            </>
          )}
        </>
      )}
    </div>
  );
};

export default SelectWithCustomDropdown;
