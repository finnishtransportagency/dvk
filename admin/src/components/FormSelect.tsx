import { IonItem, IonLabel, IonNote, IonSelect, IonSelectOption } from '@ionic/react';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActionType, ActionTypeSelect, Lang, ValueType } from '../utils/constants';
import { Text } from '../graphql/generated';
import { ReactComponent as ErrorIcon } from '../theme/img/error_icon.svg';
import { SelectChangeEventDetail, IonSelectCustomEvent } from '@ionic/core';

interface SelectOption {
  id: number | string | boolean;
  name?: Text | null;
}

interface SelectProps {
  label: string;
  selected?: ValueType;
  options: SelectOption[] | null;
  setSelected: (value: ValueType, actionType: ActionType | ActionTypeSelect) => void;
  actionType: ActionTypeSelect;
  required?: boolean;
  multiple?: boolean;
  showId?: boolean;
  disabled?: boolean;
  hideLabel?: boolean;
}

const FormSelect: React.FC<SelectProps> = ({
  label,
  selected,
  options,
  setSelected,
  actionType,
  required,
  multiple,
  showId,
  disabled,
  hideLabel,
}) => {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'general' });
  const lang = i18n.resolvedLanguage as Lang;
  const sortedOptions = options?.sort((a, b) => {
    const nameA = (a.name && a.name[lang]) || '';
    const nameB = (b.name && b.name[lang]) || '';
    return nameA.localeCompare(nameB);
  });

  const selectRef = useRef<HTMLIonSelectElement>(null);
  const focusInput = () => {
    selectRef.current?.click();
  };

  const compareOptions = (o1: string | number, o2: string | number) => {
    if (!o1 || !o2) {
      return o1 === o2;
    }
    return o1 === o2;
  };

  const [isValid, setIsValid] = useState(true);

  const checkValidity = () => {
    const validity = Array.isArray(selected) ? selected.length > 0 : !!selected;
    setIsValid(required ? validity : true);
  };
  const handleChange = (event: IonSelectCustomEvent<SelectChangeEventDetail<boolean | number | string | number[] | string[]>>) => {
    checkValidity();
    setSelected(event.detail.value, actionType);
  };

  return (
    <>
      {!hideLabel && (
        <IonLabel className="formLabel" onClick={() => focusInput()}>
          {label} {required ? '*' : ''}
        </IonLabel>
      )}
      <IonItem fill="outline" className={'selectInput' + (isValid ? '' : ' invalid')}>
        <IonSelect
          ref={selectRef}
          placeholder={t('choose') || ''}
          interface="popover"
          onIonChange={(ev) => handleChange(ev)}
          onIonBlur={() => checkValidity()}
          interfaceOptions={{
            size: 'cover',
            className: 'multiSelect',
          }}
          value={selected}
          multiple={Array.isArray(selected) || multiple}
          compareWith={Array.isArray(selected) ? compareOptions : undefined}
          disabled={disabled}
        >
          {sortedOptions &&
            sortedOptions.map((item) => {
              const optionLabel = (showId ? '[' + item.id + '] ' : '') + (item.name ? item.name[lang] || item.name.fi : item.id);
              return (
                <IonSelectOption key={item.id.toString()} value={item.id}>
                  {optionLabel}
                </IonSelectOption>
              );
            })}
        </IonSelect>
        {(Array.isArray(selected) || multiple) && <IonNote slot="helper">{t('multiple-values-supported')}</IonNote>}
        <IonNote slot="error" className="input-error">
          <ErrorIcon aria-label={t('error') || ''} />
          {t('required-field')}
        </IonNote>
      </IonItem>
    </>
  );
};

export default FormSelect;
