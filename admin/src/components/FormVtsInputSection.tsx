import React from 'react';
import { IonCol, IonGrid, IonRow } from '@ionic/react';
import { ActionType, Lang, ValidationType } from '../utils/constants';
import { useTranslation } from 'react-i18next';
import FormInput from './FormInput';
import { VhfInput, VtsInput } from '../graphql/generated';
import FormTextInputRow from './FormTextInputRow';
import FormOptionalSection from './FormOptionalSection';

interface FormVtsInputSectionProps {
  section: VtsInput;
  idx: number;
  updateState: (
    value: string | boolean,
    actionType: ActionType,
    actionLang?: Lang,
    actionTarget?: string | number,
    actionOuterTarget?: string | number
  ) => void;
  open: boolean;
  focused?: boolean;
  validationErrors?: ValidationType[];
  disabled?: boolean;
}

const FormVtsInputSection: React.FC<FormVtsInputSectionProps> = ({ section, idx, updateState, open, focused, validationErrors, disabled }) => {
  const { t } = useTranslation();

  return (
    <div className={'sectionContent' + (open ? ' open' : ' closed')}>
      <IonGrid className="formGrid">
        <FormTextInputRow
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
          disabled={disabled}
          focused={focused}
        />
        <IonRow>
          <IonCol sizeMd="6">
            <FormInput
              label={t('general.email')}
              val={section.email?.join(',')}
              setValue={updateState}
              actionType="vtsEmail"
              actionTarget={idx}
              inputType="email"
              helperText={t('general.use-comma-separated-values')}
              multiple
              disabled={disabled}
            />
          </IonCol>
          <IonCol sizeMd="6">
            <FormInput
              label={t('general.phone-number')}
              val={section.phoneNumber}
              setValue={updateState}
              actionType="vtsPhone"
              actionTarget={idx}
              inputType="tel"
              disabled={disabled}
            />
          </IonCol>
        </IonRow>
      </IonGrid>
      <FormOptionalSection
        title={''}
        sections={section.vhf as VhfInput[]}
        updateState={updateState}
        sectionType="vhf"
        actionOuterTarget={idx}
        validationErrors={validationErrors}
        disabled={disabled}
      />
    </div>
  );
};

export default FormVtsInputSection;
