import React from 'react';
import { IonCol, IonGrid, IonRow } from '@ionic/react';
import { ActionType, Lang, ValidationType } from '../../utils/constants';
import { useTranslation } from 'react-i18next';
import TextInput from './TextInput';
import { VtsInput } from '../../graphql/generated';
import TextInputRow from './TextInputRow';

interface VtsInputSectionProps {
  section: VtsInput;
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

const VtsInputSection: React.FC<VtsInputSectionProps> = ({ section, idx, updateState, focused, validationErrors, disabled, readonly = false }) => {
  const { t } = useTranslation();

  return (
    <IonGrid className="formGrid">
      <TextInputRow
        labelKey="fairwaycard.vts-name"
        value={section.name}
        actionType="vtsName"
        updateState={updateState}
        actionTarget={idx}
        required
        error={
          !section.name?.fi || !section.name.sv || !section.name.en
            ? validationErrors?.find((error) => error.id === 'vtsName-' + idx)?.msg
            : undefined
        }
        readonly={readonly}
        disabled={!readonly && disabled}
        focused={focused}
      />
      <IonRow>
        <IonCol sizeMd="6">
          <TextInput
            label={t('general.email')}
            val={section.email?.join(',')}
            setValue={updateState}
            actionType="vtsEmail"
            actionTarget={idx}
            inputType="email"
            helperText={t('general.use-comma-separated-values')}
            multiple
            readonly={readonly}
            disabled={!readonly && disabled}
          />
        </IonCol>
        <IonCol sizeMd="6">
          <TextInput
            label={t('general.phone-number')}
            val={section.phoneNumber}
            setValue={updateState}
            actionType="vtsPhone"
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

export default VtsInputSection;
