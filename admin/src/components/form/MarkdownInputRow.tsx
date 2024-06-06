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
  updateState: (value: string, actionType: ActionType) => void;
  required?: boolean;
  disabled?: boolean;
  error?: string;
}

const MarkdownInputRow: React.FC<MarkdownInputRowProps> = ({ labelKey, value, updateState, actionType, required, disabled, error }) => {
  const { t, i18n } = useTranslation();
  const fi = i18n.getFixedT('fi');
  const sv = i18n.getFixedT('sv');
  const en = i18n.getFixedT('en');

  // Validate all language input fields when they are required (some of them are filled), even if they are not all touched
  const errorText = required && translationError(value) ? t('general.required-field') : error;

  return (
    <IonRow className="bordered">
      <IonCol sizeMd="4">
        <MarkdownInput
          label={fi(labelKey) + ' (fi)'}
          val={value?.fi ?? ''}
          setValue={updateState}
          actionType={actionType}
          actionLang="fi"
          required={required}
          disabled={disabled}
          error={errorText === t('general.required-field') && value?.fi?.trim() ? '' : errorText}
        />
      </IonCol>
      <IonCol sizeMd="4">
        <MarkdownInput
          label={sv(labelKey) + ' (sv)'}
          val={value?.sv ?? ''}
          setValue={updateState}
          actionType={actionType}
          actionLang="sv"
          required={required}
          disabled={disabled}
          error={errorText === t('general.required-field') && value?.sv?.trim() ? '' : errorText}
        />
      </IonCol>
      <IonCol sizeMd="4">
        <MarkdownInput
          label={en(labelKey) + ' (en)'}
          val={value?.en ?? ''}
          setValue={updateState}
          actionType={actionType}
          actionLang="en"
          required={required}
          disabled={disabled}
          error={errorText === t('general.required-field') && value?.en?.trim() ? '' : errorText}
        />
      </IonCol>
    </IonRow>
  );
};

export default MarkdownInputRow;
