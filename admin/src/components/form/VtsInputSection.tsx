import React from 'react';
import { IonCol, IonGrid, IonRow } from '@ionic/react';
import { ActionType, Lang, SelectOption, ValidationType, ValueType } from '../../utils/constants';
import { useTranslation } from 'react-i18next';
import TextInput from './TextInput';
import { FairwayCardInput, Status, Vts, VtsInput } from '../../graphql/generated';
//import TextInputRow from './TextInputRow';
import SelectInput from './SelectInput';

interface VtsInputSectionProps {
  section: VtsInput;
  idx: number;
  updateState: (
    value: ValueType,
    actionType: ActionType,
    actionLang?: Lang,
    actionTarget?: string | number,
    actionOuterTarget?: string | number
  ) => void;
  state?: FairwayCardInput;
  vtsAreas?: Vts[];
  isLoadingVtsAreas?: boolean;
  focused?: boolean;
  validationErrors?: ValidationType[];
  disabled?: boolean;
  readonly?: boolean;
}

const VtsInputSection: React.FC<VtsInputSectionProps> = ({
  section,
  idx,
  updateState,
  state,
  vtsAreas,
  isLoadingVtsAreas,
  disabled,
  readonly = false,
}) => {
  const { t } = useTranslation();
  // filter out options that are selected in other sectionss
  const selectOptions = vtsAreas?.filter((area) => {
    return !state?.trafficService?.vtsIds?.some((id) => area.id === id && section.id !== id);
  }) as SelectOption[];

  return (
    <IonGrid className="formGrid subSectionMargin">
      <IonRow>
        <SelectInput
          label={t('fairwaycard.vts-label')}
          selected={state?.trafficService?.vtsIds?.[idx]}
          options={selectOptions ?? []}
          setSelected={updateState}
          actionType="vtsIds"
          actionTarget={idx}
          isLoading={isLoadingVtsAreas}
          disabled={!readonly && state?.status === Status.Removed}
          readonly={readonly}
        />
      </IonRow>
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
