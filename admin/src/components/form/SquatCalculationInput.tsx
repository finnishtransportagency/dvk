import React, { useEffect, useState } from 'react';
import { SquatCalculationInput as GraphqlSquatCalculationInput } from '../../graphql/generated';
import { ActionType, AreaSelectOption, FairwayForm, Lang, SelectOption, ValidationType, ValueType } from '../../utils/constants';
import { IonCol, IonGrid, IonNote, IonRow } from '@ionic/react';
import TextInputRow from './TextInputRow';
import SelectWithCustomDropdown from './SelectWithCustomDropdown';
import { Trans, useTranslation } from 'react-i18next';
import TextInput from './TextInput';
import SelectInput from './SelectInput';
import { sortAreaSelectOptions } from '../../utils/common';
import NotificationModal from '../NotificationModal';
import { getPossibleAreas, getOrphanedAreaIdsFromSquatCalculationInput } from '../../utils/squatCalculationUtils';

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
  fairwayAreas?: AreaSelectOption[];
  isLoadingAreas?: boolean;
  isLoadingFairways?: boolean;
  areasReady?: boolean;
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
  isLoadingAreas,
  isLoadingFairways,
  areasReady = false,
}) => {
  const [deleteWarningModalOpen, setDeleteWarningModalOpen] = useState<boolean>(false);
  const { t } = useTranslation();
  const [filteredAreaOptions, setFilteredAreaOptions] = useState<AreaSelectOption[]>([]);
  const [sortedAreas, setSortedAreas] = useState<AreaSelectOption[]>([]);
  const [sortedSelectedAreas, setSortedSelectedAreas] = useState<AreaSelectOption[]>([]);
  const [orphanedAreasInSquatCalculation, setOrphanedAreasInSquatCalculation] = useState<number[] | undefined>(undefined);
  function updateStateAndDepth(
    value: ValueType,
    actionType: ActionType,
    actionLang?: Lang,
    actionTarget?: string | number,
    actionOuterTarget?: string | number
  ) {
    //This function "overloads" the setState to calculate also the depth and set that through the reducer
    const sortedSelectedAreas = sortAreaSelectOptions(filteredAreaOptions.filter((a) => (value as number[])?.includes(a.id as number)));
    const calculatedDepth = sortedSelectedAreas && sortedSelectedAreas.length > 0 ? (sortedSelectedAreas[0].depth ?? 0) : 0;
    //First updateState doesn't trigger refresh so set the value explicity....
    section.depth = calculatedDepth;
    //....then call reducer
    updateState(calculatedDepth, 'squatCalculationDepth', undefined, idx, undefined);
    //Call the reducer with the trigger value
    updateState(value, actionType, actionLang, actionTarget, actionOuterTarget);
  }

  function updateStateCheckDeletes(
    value: ValueType,
    actionType: ActionType,
    actionLang?: Lang,
    actionTarget?: string | number,
    actionOuterTarget?: string | number
  ) {
    const ids = value as number[];
    if (
      section.targetFairways &&
      section.targetFairways.length > ids.length &&
      section.suitableFairwayAreas?.find(
        (a) =>
          !getPossibleAreas(fairwayAreas, ids)
            .map((a) => a.id)
            .includes(a)
      )
    ) {
      setDeleteWarningModalOpen(true);
      return;
    }
    updateState(value, actionType, actionLang, actionTarget, actionOuterTarget);
  }

  useEffect(() => {
    setFilteredAreaOptions(getPossibleAreas(fairwayAreas, section.targetFairways ?? []));
  }, [fairwayAreas, section.targetFairways]);

  useEffect(() => {
    setOrphanedAreasInSquatCalculation(areasReady ? getOrphanedAreaIdsFromSquatCalculationInput(section, filteredAreaOptions) : undefined);
  }, [areasReady, section, filteredAreaOptions]);

  useEffect(() => {
    setSortedSelectedAreas(sortAreaSelectOptions(filteredAreaOptions.filter((a) => section.suitableFairwayAreas?.includes(a.id as number))));
    let sa = sortAreaSelectOptions(filteredAreaOptions);
    const orphans = areasReady ? getOrphanedAreaIdsFromSquatCalculationInput(section, filteredAreaOptions) : undefined;
    if (orphans) {
      sa = sa.concat(
        orphans.map((a) => {
          return { id: a, subtext: '-' } as AreaSelectOption;
        })
      );
    }
    setSortedAreas(sa);
  }, [areasReady, section, filteredAreaOptions]);

  const multipleDepths =
    sortedSelectedAreas &&
    sortedSelectedAreas.length > 1 &&
    sortedSelectedAreas[0].depth !== sortedSelectedAreas[sortedSelectedAreas.length - 1].depth;

  const getErrorText = (control: string) => {
    return validationErrors.find((error) => error.id === control + '-' + idx)?.msg;
  };
  const areaErrorText = multipleDepths ? t('fairwaycard.squat-calculation-depth-warning') : getErrorText('squatSuitableFairwayAreaIds');
  const placeErrorText = !section.place?.fi || !section.place?.sv || !section.place?.en ? getErrorText('squatCalculationPlace') : undefined;

  return (
    <>
      <IonGrid className="formGrid subSectionMargin">
        <TextInputRow
          name="squatCalculationPlace"
          labelKey="fairwaycard.calculation-place"
          value={section.place}
          actionType="squatCalculationPlace"
          updateState={updateState}
          actionTarget={idx}
          required
          error={placeErrorText}
          readonly={readonly}
          disabled={!readonly && disabled}
          helperText={t('fairwaycard.squat-calculation-place-help-text')}
        />
        <IonRow>
          <IonCol sizeMd="3">
            <SelectWithCustomDropdown
              name="squatTargetFairwayIds"
              data-testid="squatTargetFairwayIds"
              dropdownType="filter"
              label={t('fairwaycard.squat-target-fairways')}
              options={fairwaySelection ?? []}
              selected={section.targetFairways || []}
              setSelected={updateStateCheckDeletes}
              actionType="squatTargetFairwayIds"
              actionTarget={idx}
              isLoading={isLoadingFairways}
              required
              showId
              disabled={!readonly && disabled}
              readonly={readonly}
              error={getErrorText('squatTargetFairwayIds')}
            />
          </IonCol>
          <IonCol sizeMd="3">
            <SelectWithCustomDropdown
              name="squatSuitableFairwayAreaIds"
              data-testid="squatSuitableFairwayAreaIds"
              dropdownType="filter"
              label={t('fairwaycard.squat-suitable-fairway-areas')}
              options={sortedAreas ?? []}
              selected={section.suitableFairwayAreas || []}
              setSelected={updateStateAndDepth}
              actionType="squatSuitableFairwayAreaIds"
              actionTarget={idx}
              isLoading={isLoadingAreas}
              required
              disabled={!readonly && (disabled || (section.targetFairways?.length ?? 0) < 1)}
              readonly={readonly}
              ignoreHelperText={multipleDepths || (orphanedAreasInSquatCalculation ?? []).length > 0}
              warning={(orphanedAreasInSquatCalculation ?? []).length > 0}
              error={(orphanedAreasInSquatCalculation ?? []).length > 0 ? '' : areaErrorText}
            />
            {(orphanedAreasInSquatCalculation ?? []).length > 0 && (
              <IonNote className="input-warning">
                <Trans
                  t={t}
                  i18nKey={t('fairwaycard.squat-calculation-area-orphaned', {
                    count: orphanedAreasInSquatCalculation?.length,
                    ids: orphanedAreasInSquatCalculation?.join(', '),
                  })}
                />
              </IonNote>
            )}
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
              decimalCount={1}
              unit="m"
              required
              readonly={true}
              helperText={t('fairwaycard.squat-calculation-depth-help-text')}
            />
          </IonCol>
          <IonCol>
            <TextInput
              label={t('fairwaycard.calculation-estimated-water-depth')}
              inputType="number"
              val={section.estimatedWaterDepth}
              min={section.depth ?? 0}
              decimalCount={1}
              setValue={updateState}
              actionType="squatCalculationEstimatedWaterDepth"
              actionTarget={idx}
              name={'squatCalculationEstimatedWaterDepth-' + idx}
              required
              unit="m"
              disabled={!readonly && disabled}
              readonly={readonly}
              error={getErrorText('squatCalculationEstimatedWaterDepth')}
              helperText={t('fairwaycard.squat-calculation-estimated-water-depth-help-text')}
            />
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol sizeMd="3">
            <SelectInput
              data-testid="squatCalculationFairwayForm"
              name="squatCalculationFairwayForm"
              label={t('fairwaycard.calculation-fairway-form')}
              selected={(section.fairwayForm as number) ?? undefined}
              options={[
                { name: { fi: t('fairwaycard.calculation-fairway-form.open-water') }, id: FairwayForm.OpenWater },
                { name: { fi: t('fairwaycard.calculation-fairway-form.channel') }, id: FairwayForm.Channel },
                { name: { fi: t('fairwaycard.calculation-fairway-form.sloped-channel') }, id: FairwayForm.SlopedChannel },
              ]}
              setSelected={updateState}
              actionType="squatCalculationFairwayForm"
              actionTarget={idx}
              required
              disabled={!readonly && disabled}
              readonly={readonly}
              error={getErrorText('squatCalculationFairwayForm')}
              helperText={t('fairwaycard.squat-calculation-fairway-form-help-text')}
            />
          </IonCol>
          <IonCol>
            <TextInput
              label={t('fairwaycard.calculation-fairway-width')}
              inputType="number"
              min={0}
              max={300}
              ignoreAllowedValueText={true}
              decimalCount={0}
              val={section.fairwayWidth}
              setValue={updateState}
              actionType="squatCalculationFairwayWidth"
              actionTarget={idx}
              name={'squatCalculationFairwayWidth-' + idx}
              unit="m"
              required
              disabled={!readonly && (disabled || !section.fairwayForm || section.fairwayForm === 1)}
              readonly={readonly}
              error={getErrorText('squatCalculationFairwayWidth')}
            />
          </IonCol>
          <IonCol>
            <TextInput
              label={t('fairwaycard.calculation-slope-scale')}
              inputType="number"
              min={0.1}
              max={10}
              ignoreAllowedValueText={true}
              decimalCount={1}
              val={section.slopeScale}
              setValue={updateState}
              actionType="squatCalculationSlopeScale"
              actionTarget={idx}
              name={'squatCalculationSlopeScale-' + idx}
              required
              disabled={!readonly && (disabled || !section.fairwayForm || section.fairwayForm !== 3)}
              readonly={readonly}
              error={getErrorText('squatCalculationSlopeScale')}
            />
          </IonCol>
          <IonCol>
            <TextInput
              label={t('fairwaycard.calculation-slope-height')}
              inputType="number"
              min={0}
              max={12}
              ignoreAllowedValueText={true}
              decimalCount={1}
              val={section.slopeHeight}
              setValue={updateState}
              actionType="squatCalculationSlopeHeight"
              actionTarget={idx}
              name={'squatCalculationSlopeHeight-' + idx}
              unit="m"
              required
              disabled={!readonly && (disabled || !section.fairwayForm || section.fairwayForm !== 3)}
              readonly={readonly}
              error={getErrorText('squatCalculationSlopeHeight')}
            />
          </IonCol>
        </IonRow>
        <TextInputRow
          name="squatCalculationAdditionalInformation"
          labelKey="fairwaycard.calculation-additional-information"
          value={section.additionalInformation}
          actionType="squatCalculationAdditionalInformation"
          required={!!section.additionalInformation?.fi || !!section.additionalInformation?.sv || !!section.additionalInformation?.en}
          updateState={updateState}
          actionTarget={idx}
          readonly={readonly}
          disabled={!readonly && disabled}
          helperText={t('fairwaycard.squat-calculation-additional-information-help-text')}
        />
      </IonGrid>
      <NotificationModal
        isOpen={deleteWarningModalOpen}
        closeAction={() => setDeleteWarningModalOpen(false)}
        closeTitle={t('general.close')}
        header={t('fairwaycard.squat-calculation-cannot-remove-fairway-header')}
        message={t('fairwaycard.squat-calculation-cannot-remove-fairway')}
      />
    </>
  );
};

export default SquatCalculationInput;
