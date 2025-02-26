import React from 'react';
import { IonButton, IonCol, IonGrid, IonRow } from '@ionic/react';
import { ActionType, Lang, SelectOption, ValueType } from '../../utils/constants';
import { useTranslation } from 'react-i18next';
import TextInput from './TextInput';
import { FairwayCardInput, Status, Vts, VtsInput } from '../../graphql/generated';
import TextInputRow from './TextInputRow';
import SelectInput from './SelectInput';
import BinIcon from '../../theme/img/bin.svg?react';

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
  deleteSection: (idx: number) => void;
  state?: FairwayCardInput;
  vtsAreas?: Vts[];
  isLoadingVtsAreas?: boolean;
  readonly?: boolean;
}

const VtsInputSection: React.FC<VtsInputSectionProps> = ({
  section,
  idx,
  updateState,
  deleteSection,
  state,
  vtsAreas,
  isLoadingVtsAreas,
  readonly = false,
}) => {
  const { t } = useTranslation();
  // filter out options that are selected in other sectionss
  const selectOptions = vtsAreas?.filter((area) => {
    return !state?.trafficService?.vtsIds?.some((id) => area.id === id && section.id !== id);
  }) as SelectOption[];
  const sectionData = vtsAreas?.find((area) => area.id === section.id);

  return (
    <IonGrid className="formGrid subSectionMargin">
      <IonRow>
        <IonCol>
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
        </IonCol>
        <IonCol>
          <TextInput
            label={t('general.email')}
            val={sectionData?.email?.join(',')}
            setValue={updateState}
            actionType="vtsEmail"
            actionTarget={idx}
            inputType="email"
            helperText={t('general.use-comma-separated-values')}
            multiple
            readonly={true}
            disabled={true}
          />
        </IonCol>
        <IonCol>
          <TextInput
            label={t('general.phone-number')}
            val={sectionData?.phoneNumber}
            setValue={updateState}
            actionType="vtsPhone"
            actionTarget={idx}
            inputType="tel"
            readonly={true}
            disabled={true}
          />
        </IonCol>
        <IonButton
          style={{ margin: '32px 0px 0px 14px' }}
          className="icon-only small toggle"
          fill="clear"
          onClick={() => deleteSection(idx)}
          title={t('general.delete') ?? ''}
          aria-label={t('general.delete') ?? ''}
        >
          <BinIcon />
        </IonButton>
      </IonRow>
      <TextInputRow
        labelKey="fairwaycard.vts-name"
        value={sectionData?.name}
        actionType="vtsName"
        updateState={updateState}
        actionTarget={idx}
        required
        readonly={true}
        disabled={true}
      />
    </IonGrid>
  );
};

export default VtsInputSection;
