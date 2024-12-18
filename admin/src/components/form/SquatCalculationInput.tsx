import React, { useState } from 'react';
import { SquatCalculationInput as GraphqlSquatCalculationInput } from '../../graphql/generated';
import { ActionType, AreaSelectOption, FairwayForm, Lang, SelectOption, ValidationType, ValueType } from '../../utils/constants';
import { IonCol, IonGrid, IonRow } from '@ionic/react';
import TextInputRow from './TextInputRow';
import SelectWithCustomDropdown from './SelectWithCustomDropdown';
import { useTranslation } from 'react-i18next';
import TextInput from './TextInput';
import SelectInput from './SelectInput';
import { sortAreaSelectOptions } from '../../utils/common';
import NotificationModal from '../NotificationModal';

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
}) => {
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
          !getPossibleAreas(ids)
            .map((a) => a.id)
            .includes(a)
      )
    ) {
      setDeleteWarningModalOpen(true);
      return;
    }
    updateState(value, actionType, actionLang, actionTarget, actionOuterTarget);
  }

  function getPossibleAreas(fairwayIds: number[]) {
    const filteredAreaOptions: AreaSelectOption[] = [];
    fairwayIds.forEach((f) => {
      fairwayAreas
        ?.filter((item) => item.fairwayIds?.includes(f))
        .forEach((o) => {
          filteredAreaOptions.push(o);
        });
    });

    //Filter out duplicates - done in seperate line to avoid 4 nested Sonar warning
    return filteredAreaOptions.reduce(function (pre: AreaSelectOption[], cur: AreaSelectOption) {
      if (!pre.find((a) => a.id === cur.id)) {
        pre.push(cur);
      }
      return pre;
    }, []);
  }

  const [deleteWarningModalOpen, setDeleteWarningModalOpen] = useState<boolean>(false);
  const { t } = useTranslation();

  const filteredAreaOptions = getPossibleAreas(section.targetFairways ?? []);
  const sortedAreas = sortAreaSelectOptions(filteredAreaOptions);
  const sortedSelectedAreas = sortAreaSelectOptions(filteredAreaOptions.filter((a) => section.suitableFairwayAreas?.includes(a.id as number)));
  const multipleDepths =
    sortedSelectedAreas &&
    sortedSelectedAreas.length > 1 &&
    sortedSelectedAreas[0].depth !== sortedSelectedAreas[sortedSelectedAreas.length - 1].depth;

  console.log(multipleDepths);
  return (
    <>
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
          helperText={t('fairwaycard.squat-calculation-place-help-text')}
        />
        <IonRow>
          <IonCol sizeMd="3">
            <SelectWithCustomDropdown
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
              error={validationErrors.find((error) => error.id === 'squatTargetFairwayIds-' + idx)?.msg}
            />
          </IonCol>
          <IonCol sizeMd="3">
            <SelectWithCustomDropdown
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
              ignoreHelperText={multipleDepths}
              error={
                multipleDepths
                  ? t('fairwaycard.squat-calculation-depth-warning')
                  : validationErrors.find((error) => error.id === 'squatSuitableFairwayAreaIds-' + idx)?.msg
              }
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
              decimalCount={1}
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
              disabled={!readonly && disabled}
              readonly={readonly}
              error={validationErrors.find((error) => error.id === 'squatCalculationEstimatedWaterDepth-' + idx)?.msg}
              helperText={t('fairwaycard.squat-calculation-estimated-water-depth-help-text')}
            />
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol sizeMd="3">
            <SelectInput
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
              error={validationErrors.find((error) => error.id === 'squatCalculationFairwayForm-' + idx)?.msg}
              helperText={t('fairwaycard.squat-calculation-fairway-form-help-text')}
            />
          </IonCol>
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
              disabled={!readonly && (disabled || !section.fairwayForm || section.fairwayForm === 1)}
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
              disabled={!readonly && (disabled || !section.fairwayForm || section.fairwayForm !== 3)}
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
              disabled={!readonly && (disabled || !section.fairwayForm || section.fairwayForm !== 3)}
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
