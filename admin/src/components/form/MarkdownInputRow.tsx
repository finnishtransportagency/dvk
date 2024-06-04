import React from 'react';
import { IonCol, IonRow } from '@ionic/react';
import { ActionType } from '../../utils/constants';
import { useTranslation } from 'react-i18next';
import { Text } from '../../graphql/generated';
import MarkdownInput from './MarkdownInput';

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
  const errorText = error === t('general.required-field') && value?.fi?.trim() ? '' : error;

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
          error={errorText}
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
          error={errorText}
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
          error={errorText}
        />
      </IonCol>
    </IonRow>
  );
};

export default MarkdownInputRow;
