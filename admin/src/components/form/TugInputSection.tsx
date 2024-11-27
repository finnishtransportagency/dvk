import React from 'react';
import { IonCol, IonGrid, IonRow } from '@ionic/react';
import { ActionType, Lang, ValidationType } from '../../utils/constants';
import { useTranslation } from 'react-i18next';
import TextInput from './TextInput';
import { TugInput } from '../../graphql/generated';
import TextInputRow from './TextInputRow';

interface TugInputSectionProps {
  className: string;
  section: TugInput;
  idx: number;
  updateState: (
    value: string | boolean,
    actionType: ActionType,
    actionLang?: Lang,
    actionTarget?: string | number,
    actionOuterTarget?: string | number
  ) => void;
  focused?: boolean;
  validationErrors?: ValidationType[];
  disabled?: boolean;
  readonly?: boolean;
}

const TugInputSection: React.FC<TugInputSectionProps> = ({
  className,
  section,
  idx,
  updateState,
  focused,
  validationErrors,
  disabled,
  readonly = false,
}) => {
  const { t } = useTranslation();

  return (
    <IonGrid className={'formGrid ' + className}>
      <TextInputRow
        labelKey="fairwaycard.tug-name"
        value={section.name}
        actionType="tugName"
        updateState={updateState}
        actionTarget={idx}
        required
        error={
          !section.name?.fi || !section.name?.sv || !section.name?.en
            ? validationErrors?.find((error) => error.id === 'tugName-' + idx)?.msg
            : undefined
        }
        readonly={readonly}
        disabled={!readonly && disabled}
        focused={focused}
      />
      <IonRow>
        <IonCol sizeMd="4">
          <TextInput
            label={t('general.email')}
            val={section.email}
            setValue={updateState}
            actionType="tugEmail"
            actionTarget={idx}
            inputType="email"
            readonly={readonly}
            disabled={!readonly && disabled}
          />
        </IonCol>
        <IonCol sizeMd="4">
          <TextInput
            label={t('general.phone-number')}
            val={section.phoneNumber?.join(',')}
            setValue={updateState}
            actionType="tugPhone"
            actionTarget={idx}
            helperText={t('general.use-comma-separated-values')}
            inputType="tel"
            multiple
            readonly={readonly}
            disabled={!readonly && disabled}
          />
        </IonCol>
        <IonCol sizeMd="4">
          <TextInput
            label={t('general.fax')}
            val={section.fax}
            setValue={updateState}
            actionType="tugFax"
            actionTarget={idx}
            inputType="tel"
            readonly={readonly}
            disabled={!readonly && disabled}
          />
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};

export default TugInputSection;
