import React from 'react';
import { IonCol, IonRow } from '@ionic/react';
import { ActionType } from '../../utils/constants';
import { useTranslation } from 'react-i18next';
import { Text } from '../../graphql/generated';
import MarkdownInput from './MarkdownInput';
import { translationError } from '../../utils/formValidations';

interface MarkdownInputRowProps {
  labelKey: string;
  value?: Text | null;
  actionType: ActionType;
  actionTarget?: string | number;
  updateState: (value: string, actionType: ActionType) => void;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  readonly?: boolean;
}

const MarkdownInputRow: React.FC<MarkdownInputRowProps> = ({
  labelKey,
  value,
  updateState,
  actionType,
  actionTarget,
  required,
  disabled,
  error,
  readonly = false,
}) => {
  const { t, i18n } = useTranslation();
  const fi = i18n.getFixedT('fi');
  const sv = i18n.getFixedT('sv');
  const en = i18n.getFixedT('en');

  // Validate all language input fields when they are required (some of them are filled), even if they are not all touched
  const errorText = required && translationError(value) ? t('general.required-field') : error;
  const helperText = t('general.markdown.helper-text');

  return (
    <IonRow className="bordered">
      <IonCol sizeMd="4">
        <MarkdownInput
          label={fi(labelKey) + ' (fi)'}
          val={value?.fi ?? ''}
          setValue={updateState}
          actionType={actionType}
          actionLang="fi"
          actionTarget={actionTarget}
          required={required}
          readonly={readonly}
          disabled={!readonly && disabled}
          error={errorText === t('general.required-field') && value?.fi?.trim() ? '' : errorText}
          helperText={helperText}
        />
      </IonCol>
      <IonCol sizeMd="4">
        <MarkdownInput
          label={sv(labelKey) + ' (sv)'}
          val={value?.sv ?? ''}
          setValue={updateState}
          actionType={actionType}
          actionLang="sv"
          actionTarget={actionTarget}
          required={required}
          readonly={readonly}
          disabled={!readonly && disabled}
          error={errorText === t('general.required-field') && value?.sv?.trim() ? '' : errorText}
          helperText={helperText}
        />
      </IonCol>
      <IonCol sizeMd="4">
        <MarkdownInput
          label={en(labelKey) + ' (en)'}
          val={value?.en ?? ''}
          setValue={updateState}
          actionType={actionType}
          actionLang="en"
          actionTarget={actionTarget}
          required={required}
          readonly={readonly}
          disabled={!readonly && disabled}
          error={errorText === t('general.required-field') && value?.en?.trim() ? '' : errorText}
          helperText={helperText}
        />
      </IonCol>
    </IonRow>
  );
};

export default MarkdownInputRow;
