import React from 'react';
import { SquatCalculationInput as GraphqlSquatCalculationInput } from '../../graphql/generated';
import { ActionType, Lang, SelectOption, ValidationType, ValueType } from '../../utils/constants';
import { IonCol, IonGrid, IonRow } from '@ionic/react';
import TextInputRow from './TextInputRow';
import SelectWithCustomDropdown from './SelectWithCustomDropdown';
import { useTranslation } from 'react-i18next';
import TextInput from './TextInput';

interface SquatCalculationInputProps {
  idx: number;
  section: GraphqlSquatCalculationInput;
  updateState: (
    value: ValueType,
    actionType: ActionType,
    actionLang?: Lang,
    actionTarget?: string | number,
    actionOuterTarget?: string | number
  ) => void;
  validationErrors: ValidationType[];
  readonly?: boolean;
  disabled?: boolean;
  fairwaySelection?: SelectOption[];
  fairwayAreas?: SelectOption[];
}

const SquatCalculationInput: React.FC<SquatCalculationInputProps> = ({
  idx,
  section,
  updateState,
  validationErrors,
  readonly = false,
  disabled = false,
  fairwaySelection,
  fairwayAreas,
}) => {
  const { t } = useTranslation();

  return (
    <IonGrid className="formGrid">
      <TextInputRow
        labelKey="fairwaycard.calculation-place"
        value={section.place}
        actionType="squatCalculationPlace"
        updateState={updateState}
        actionTarget={idx}
        required
        error={
          !section.place?.fi || !section.place?.sv || !section.place?.en
            ? validationErrors?.find((error) => error.id === 'squatCalculationPlace-' + idx)?.msg
            : undefined
        }
        readonly={readonly}
        disabled={!readonly && disabled}
      />
      <IonRow>
        <IonCol sizeMd="3">
          <SelectWithCustomDropdown
            dropdownType="filter"
            label={t('fairwaycard.squat-target-fairways')}
            options={fairwaySelection ?? []}
            selected={section.targetFairways || []}
            setSelected={updateState}
            actionType="squatTargetFairwayIds"
            required
            showId
            disabled={!readonly && disabled}
            readonly={readonly}
            error={validationErrors.find((error) => error.id === 'squatTargetFairwayIds-' + idx)?.msg}
          />
        </IonCol>
        <IonCol sizeMd="3">
          <SelectWithCustomDropdown
            dropdownType="filter"
            label={t('fairwaycard.squat-suitable-fairway-areas')}
            options={fairwayAreas ?? []}
            selected={section.suitableFairwayAreas || []}
            setSelected={updateState}
            actionType="squatSuitableFairwayAreaIds"
            required
            showId
            disabled={!readonly && disabled}
            readonly={readonly}
            error={validationErrors.find((error) => error.id === 'squatSuitableFairwayAreaIds-' + idx)?.msg}
          />
        </IonCol>
        <IonCol>
          <TextInput
            label={t('fairwaycard.calculation-depth')}
            inputType="number"
            val={section.depth}
            setValue={updateState}
            actionType="squatCalculationDepth"
            actionTarget={idx}
            name={'squatCalculationDepth-' + idx}
            required
            disabled={!readonly && disabled}
            readonly={readonly}
            error={validationErrors.find((error) => error.id === 'squatCalculationDepth-' + idx)?.msg}
            helperText={t('fairwaycard.squat-calculation-depth-help-text')}
          />
        </IonCol>
        <IonCol>
          <TextInput
            label={t('fairwaycard.calculation-estimated-water-depth')}
            inputType="number"
            val={section.estimatedWaterDepth}
            setValue={updateState}
            actionType="squatCalculationEstimatedWaterDepth"
            actionTarget={idx}
            name={'squatCalculationEstimatedWaterDepth-' + idx}
            required
            disabled={!readonly && disabled}
            readonly={readonly}
            error={validationErrors.find((error) => error.id === 'squatCalculationEstimatedWaterDepth-' + idx)?.msg}
            helperText={t('fairwaycard.squat-calculation-estimated-water-depth-help-text')}
          />
        </IonCol>
      </IonRow>
      <IonRow>
        <IonCol sizeMd="3"></IonCol>
        <IonCol>
          <TextInput
            label={t('fairwaycard.calculation-fairway-width')}
            inputType="number"
            min={0}
            max={300}
            decimalCount={0}
            val={section.fairwayWidth}
            setValue={updateState}
            actionType="squatCalculationFairwayWidth"
            actionTarget={idx}
            name={'squatCalculationFairwayWidth-' + idx}
            unit="m"
            required
            disabled={!readonly && disabled}
            readonly={readonly}
            error={validationErrors.find((error) => error.id === 'squatCalculationFairwayWidth-' + idx)?.msg}
            helperText={t('fairwaycard.squat-calculation-fairway-width-help-text')}
          />
        </IonCol>
        <IonCol>
          <TextInput
            label={t('fairwaycard.calculation-slope-scale')}
            inputType="number"
            min={0.1}
            max={10}
            decimalCount={1}
            val={section.slopeScale}
            setValue={updateState}
            actionType="squatCalculationSlopeScale"
            actionTarget={idx}
            name={'squatCalculationSlopeScale-' + idx}
            required
            disabled={!readonly && disabled}
            readonly={readonly}
            error={validationErrors.find((error) => error.id === 'squatCalculationSlopeScale-' + idx)?.msg}
            helperText={t('fairwaycard.squat-calculation-slope-scale-help-text')}
          />
        </IonCol>
        <IonCol>
          <TextInput
            label={t('fairwaycard.calculation-slope-height')}
            inputType="number"
            min={0}
            max={12}
            decimalCount={1}
            val={section.slopeHeight}
            setValue={updateState}
            actionType="squatCalculationSlopeHeight"
            actionTarget={idx}
            name={'squatCalculationSlopeHeight-' + idx}
            required
            disabled={!readonly && disabled}
            readonly={readonly}
            error={validationErrors.find((error) => error.id === 'squatCalculationSlopeHeight-' + idx)?.msg}
            helperText={t('fairwaycard.squat-calculation-slope-height-help-text')}
          />
        </IonCol>
      </IonRow>
      <TextInputRow
        labelKey="fairwaycard.calculation-additional-information"
        value={section.additionalInformation}
        actionType="squatCalculationAdditionalInformation"
        updateState={updateState}
        actionTarget={idx}
        required
        error={
          !section.additionalInformation?.fi || !section.additionalInformation?.sv || !section.additionalInformation?.en
            ? validationErrors?.find((error) => error.id === 'squatCalculationAdditionalInformation-' + idx)?.msg
            : undefined
        }
        readonly={readonly}
        disabled={!readonly && disabled}
      />
    </IonGrid>
  );
};

export default SquatCalculationInput;
