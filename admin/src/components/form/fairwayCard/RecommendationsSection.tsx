import React from 'react';
import { IonCol, IonGrid, IonRow } from '@ionic/react';
import { ActionType, Lang, ValidationType, ValueType } from '../../../utils/constants';
import { FairwayCardInput, Mareograph, Status } from '../../../graphql/generated';
import TextInputRow from '../TextInputRow';
import { useTranslation } from 'react-i18next';
import SelectWithCustomDropdown from '../SelectWithCustomDropdown';
import { mareographsToSelectOptionList } from '../../../utils/common';

interface RecommendationsSectionProps {
  state: FairwayCardInput;
  updateState: (
    value: ValueType,
    actionType: ActionType,
    actionLang?: Lang,
    actionTarget?: string | number,
    actionOuterTarget?: string | number
  ) => void;
  validationErrors: ValidationType[];
  isLoadingMareographs?: boolean;
  mareographOptions?: Mareograph[];
  readonly?: boolean;
}

const RecommendationsSection: React.FC<RecommendationsSectionProps> = ({
  state,
  updateState,
  validationErrors,
  isLoadingMareographs,
  mareographOptions,
  readonly = false,
}) => {
  const { t } = useTranslation();

  return (
    <IonGrid className="formGrid">
      <TextInputRow
        labelKey="fairwaycard.wind-recommendation"
        value={state.windRecommendation}
        updateState={updateState}
        actionType="windRecommendation"
        required={!!state.windRecommendation?.fi || !!state.windRecommendation?.sv || !!state.windRecommendation?.en}
        readonly={readonly}
        disabled={!readonly && state.status === Status.Removed}
        error={validationErrors.find((error) => error.id === 'windRecommendation')?.msg}
        inputType="textarea"
      />
      <TextInputRow
        labelKey="fairwaycard.vessel-recommendation"
        value={state.vesselRecommendation}
        updateState={updateState}
        actionType="vesselRecommendation"
        required={!!state.vesselRecommendation?.fi || !!state.vesselRecommendation?.sv || !!state.vesselRecommendation?.en}
        readonly={readonly}
        disabled={!readonly && state.status === Status.Removed}
        error={validationErrors.find((error) => error.id === 'vesselRecommendation')?.msg}
        inputType="textarea"
      />
      <TextInputRow
        labelKey="fairwaycard.visibility-recommendation"
        value={state.visibility}
        updateState={updateState}
        actionType="visibility"
        required={!!state.visibility?.fi || !!state.visibility?.sv || !!state.visibility?.en}
        readonly={readonly}
        disabled={!readonly && state.status === Status.Removed}
        error={validationErrors.find((error) => error.id === 'visibility')?.msg}
        inputType="textarea"
      />
      <IonRow>
        <IonCol size="3.95">
          <SelectWithCustomDropdown
            dropdownType="filter"
            label={t('fairwaycard.linked-mareographs')}
            options={mareographsToSelectOptionList(mareographOptions)}
            selected={state.mareographs ?? []}
            setSelected={updateState}
            actionType="mareographs"
            readonly={readonly}
            disabled={!readonly && state.status === Status.Removed}
            isLoading={isLoadingMareographs}
          />
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};

export default RecommendationsSection;
