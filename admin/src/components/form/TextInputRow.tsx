import React from 'react';
import { IonCol, IonRow } from '@ionic/react';
import { ActionType } from '../../utils/constants';
import { useTranslation } from 'react-i18next';
import TextInput from './TextInput';
import Textarea from './Textarea';
import { Text } from '../../graphql/generated';
import { translationError } from '../../utils/formValidations';

interface TextInputRowProps {
  labelKey: string;
  value?: Text | null;
  actionType: ActionType;
  updateState: (value: string, actionType: ActionType) => void;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  error?: string;
  helperText?: string | null;
  inputType?: '' | 'input' | 'textarea';
  actionTarget?: string | number;
  actionOuterTarget?: string | number;
  focused?: boolean;
  name?: string;
  maxCharLength?: number;
}

const TextInputRow: React.FC<TextInputRowProps> = ({
  labelKey,
  value,
  updateState,
  actionType,
  required,
  disabled,
  readonly = false,
  error,
  helperText,
  inputType,
  actionTarget,
  actionOuterTarget,
  focused,
  name,
  maxCharLength,
}) => {
  const { t, i18n } = useTranslation();
  const fi = i18n.getFixedT('fi');
  const sv = i18n.getFixedT('sv');
  const en = i18n.getFixedT('en');

  // Validate all language input fields when they are required (some of them are filled), even if they are not all touched
  const errorText = required && translationError(value) ? t('general.required-field') : error;
  // Hide required error if current language input is filled
  const errorTextFi = errorText === t('general.required-field') && value?.fi?.trim() ? '' : errorText;
  const errorTextSv = errorText === t('general.required-field') && value?.sv?.trim() ? '' : errorText;
  const errorTextEn = errorText === t('general.required-field') && value?.en?.trim() ? '' : errorText;

  return (
    <IonRow className="bordered">
      <IonCol sizeMd="4">
        {(!inputType || inputType === 'input') && (
          <TextInput
            label={fi(labelKey) + ' (fi)'}
            name={name}
            val={value?.fi ?? ''}
            setValue={updateState}
            actionType={actionType}
            actionLang="fi"
            required={required}
            disabled={!readonly && disabled}
            readonly={readonly}
            error={errorTextFi}
            helperText={helperText}
            actionTarget={actionTarget}
            actionOuterTarget={actionOuterTarget}
            focused={focused}
            maxCharLength={maxCharLength}
          />
        )}
        {inputType === 'textarea' && (
          <Textarea
            label={fi(labelKey) + ' (fi)'}
            name={name}
            val={value?.fi ?? ''}
            setValue={updateState}
            actionType={actionType}
            actionLang="fi"
            actionTarget={actionTarget}
            required={required}
            disabled={!readonly && disabled}
            readonly={readonly}
            error={errorTextFi}
            helperText={helperText}
          />
        )}
      </IonCol>
      <IonCol sizeMd="4">
        {(!inputType || inputType === 'input') && (
          <TextInput
            label={sv(labelKey) + ' (sv)'}
            name={name}
            val={value?.sv ?? ''}
            setValue={updateState}
            actionType={actionType}
            actionLang="sv"
            required={required}
            disabled={!readonly && disabled}
            readonly={readonly}
            error={errorTextSv}
            actionTarget={actionTarget}
            actionOuterTarget={actionOuterTarget}
            maxCharLength={maxCharLength}
          />
        )}
        {inputType === 'textarea' && (
          <Textarea
            label={sv(labelKey) + ' (sv)'}
            name={name}
            val={value?.sv ?? ''}
            setValue={updateState}
            actionType={actionType}
            actionLang="sv"
            actionTarget={actionTarget}
            required={required}
            disabled={!readonly && disabled}
            readonly={readonly}
            error={errorTextSv}
          />
        )}
      </IonCol>
      <IonCol sizeMd="4">
        {(!inputType || inputType === 'input') && (
          <TextInput
            label={en(labelKey) + ' (en)'}
            name={name}
            val={value?.en ?? ''}
            setValue={updateState}
            actionType={actionType}
            actionLang="en"
            required={required}
            disabled={!readonly && disabled}
            readonly={readonly}
            error={errorTextEn}
            actionTarget={actionTarget}
            actionOuterTarget={actionOuterTarget}
            maxCharLength={maxCharLength}
          />
        )}
        {inputType === 'textarea' && (
          <Textarea
            label={en(labelKey) + ' (en)'}
            name={name}
            val={value?.en ?? ''}
            setValue={updateState}
            actionType={actionType}
            actionLang="en"
            actionTarget={actionTarget}
            required={required}
            disabled={!readonly && disabled}
            readonly={readonly}
            error={errorTextEn}
          />
        )}
      </IonCol>
    </IonRow>
  );
};

export default TextInputRow;
