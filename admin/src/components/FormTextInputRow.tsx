import React from 'react';
import { IonCol, IonRow } from '@ionic/react';
import { ActionType } from '../utils/constants';
import { useTranslation } from 'react-i18next';
import FormInput from './FormInput';
import FormTextarea from './FormTextarea';
import { Text } from '../graphql/generated';

interface InputRowProps {
  labelKey: string;
  value?: Text | null;
  actionType: ActionType;
  updateState: (value: string, actionType: ActionType) => void;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string | null;
  inputType?: '' | 'input' | 'textarea';
}

const FormTextInputRow: React.FC<InputRowProps> = ({
  labelKey,
  value,
  updateState,
  actionType,
  required,
  disabled,
  error,
  helperText,
  inputType,
}) => {
  const { t, i18n } = useTranslation();
  const fi = i18n.getFixedT('fi');
  const sv = i18n.getFixedT('sv');
  const en = i18n.getFixedT('en');

  return (
    <IonRow>
      <IonCol>
        {(!inputType || inputType === 'input') && (
          <FormInput
            label={fi(labelKey) + ' (fi)'}
            val={value?.fi || ''}
            setValue={updateState}
            actionType={actionType}
            actionLang="fi"
            required={required}
            disabled={disabled}
            error={error === t('general.required-field') && value?.fi?.trim() ? '' : error}
            helperText={helperText}
          />
        )}
        {inputType === 'textarea' && (
          <FormTextarea
            label={fi(labelKey) + ' (fi)'}
            val={value?.fi || ''}
            setValue={updateState}
            actionType={actionType}
            actionLang="fi"
            required={required}
            disabled={disabled}
            error={error === t('general.required-field') && value?.fi?.trim() ? '' : error}
            helperText={helperText}
          />
        )}
      </IonCol>
      <IonCol>
        {(!inputType || inputType === 'input') && (
          <FormInput
            label={sv(labelKey) + ' (sv)'}
            val={value?.sv || ''}
            setValue={updateState}
            actionType={actionType}
            actionLang="sv"
            required={required}
            disabled={disabled}
            error={error === t('general.required-field') && value?.sv?.trim() ? '' : error}
            helperText={helperText}
          />
        )}
        {inputType === 'textarea' && (
          <FormTextarea
            label={sv(labelKey) + ' (sv)'}
            val={value?.sv || ''}
            setValue={updateState}
            actionType={actionType}
            actionLang="sv"
            required={required}
            disabled={disabled}
            error={error === t('general.required-field') && value?.sv?.trim() ? '' : error}
            helperText={helperText}
          />
        )}
      </IonCol>
      <IonCol>
        {(!inputType || inputType === 'input') && (
          <FormInput
            label={en(labelKey) + ' (en)'}
            val={value?.en || ''}
            setValue={updateState}
            actionType={actionType}
            actionLang="en"
            required={required}
            disabled={disabled}
            error={error === t('general.required-field') && value?.en?.trim() ? '' : error}
            helperText={helperText}
          />
        )}
        {inputType === 'textarea' && (
          <FormTextarea
            label={en(labelKey) + ' (en)'}
            val={value?.en || ''}
            setValue={updateState}
            actionType={actionType}
            actionLang="en"
            required={required}
            disabled={disabled}
            error={error === t('general.required-field') && value?.en?.trim() ? '' : error}
            helperText={helperText}
          />
        )}
      </IonCol>
    </IonRow>
  );
};

export default FormTextInputRow;
