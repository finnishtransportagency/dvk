import { t } from 'i18next';
import { FairwayCardInput } from '../../graphql/generated';
import { ActionType, ErrorMessageKeys, ValidationType } from '../constants';

export const fairwayCardSquatCalculationValidator = (
  newState: FairwayCardInput,
  actionType: ActionType,
  validationErrors: ValidationType[],
  setValidationErrors: (validationErrors: ValidationType[]) => void,
  actionTarget?: string | number
) => {
  console.log(JSON.stringify(validationErrors));
  if (
    actionType === 'squatCalculationPlace' &&
    actionTarget !== undefined &&
    validationErrors.find((error) => error.id === 'squatCalculationPlace-' + actionTarget)?.msg
  ) {
    const currentCalc = newState.squatCalculations?.find((c, idx) => idx === actionTarget);
    setValidationErrors(
      validationErrors
        .filter((error) => error.id !== 'squatCalculationPlace-' + actionTarget)
        .concat({
          id: 'squatCalculationPlace-' + actionTarget,
          msg:
            currentCalc?.place?.fi.trim() || currentCalc?.place?.sv.trim() || currentCalc?.place?.en.trim()
              ? t(ErrorMessageKeys?.required) || ''
              : '',
        })
    );
  } else if (
    actionType === 'squatTargetFairwayIds' &&
    actionTarget !== undefined &&
    validationErrors.find((error) => error.id === 'squatTargetFairwayIds-' + actionTarget)?.msg
  ) {
    const currentCalc = newState.squatCalculations?.find((c, idx) => idx === actionTarget);
    setValidationErrors(
      validationErrors
        .filter((error) => error.id !== 'squatTargetFairwayIds-' + actionTarget)
        .concat({
          id: 'squatTargetFairwayIds-' + actionTarget,
          msg: currentCalc?.targetFairways ? t(ErrorMessageKeys?.required) || '' : '',
        })
    );
  } else if (
    actionType === 'squatSuitableFairwayAreaIds' &&
    actionTarget !== undefined &&
    validationErrors.find((error) => error.id === 'squatSuitableFairwayAreaIds-' + actionTarget)?.msg
  ) {
    const currentCalc = newState.squatCalculations?.find((c, idx) => idx === actionTarget);
    setValidationErrors(
      validationErrors
        .filter((error) => error.id !== 'squatSuitableFairwayAreaIds-' + actionTarget)
        .concat({
          id: 'squatSuitableFairwayAreaIds-' + actionTarget,
          msg: currentCalc?.suitableFairwayAreas ? t(ErrorMessageKeys?.required) || '' : '',
        })
    );
  } else if (
    actionType === 'squatCalculationEstimatedWaterDepth' &&
    actionTarget !== undefined &&
    validationErrors.find((error) => error.id === 'squatCalculationEstimatedWaterDepth-' + actionTarget)?.msg
  ) {
    const currentCalc = newState.squatCalculations?.find((c, idx) => idx === actionTarget);
    setValidationErrors(
      validationErrors
        .filter((error) => error.id !== 'squatCalculationEstimatedWaterDepth-' + actionTarget)
        .concat({
          id: 'squatCalculationEstimatedWaterDepth-' + actionTarget,
          msg: currentCalc?.estimatedWaterDepth ? t(ErrorMessageKeys?.required) || '' : '',
        })
    );
  } else if (
    actionType === 'squatCalculationFairwayForm' &&
    actionTarget !== undefined &&
    validationErrors.find((error) => error.id === 'squatCalculationFairwayForm-' + actionTarget)?.msg
  ) {
    const currentCalc = newState.squatCalculations?.find((c, idx) => idx === actionTarget);
    setValidationErrors(
      validationErrors
        .filter((error) => error.id !== 'squatCalculationFairwayForm-' + actionTarget)
        .concat({
          id: 'squatCalculationFairwayForm-' + actionTarget,
          msg: currentCalc?.fairwayForm ? t(ErrorMessageKeys?.required) || '' : '',
        })
    );
  } else if (
    actionType === 'squatCalculationFairwayWidth' &&
    actionTarget !== undefined &&
    validationErrors.find((error) => error.id === 'squatCalculationFairwayWidth-' + actionTarget)?.msg
  ) {
    const currentCalc = newState.squatCalculations?.find((c, idx) => idx === actionTarget);
    setValidationErrors(
      validationErrors
        .filter((error) => error.id !== 'squatCalculationFairwayWidth-' + actionTarget)
        .concat({
          id: 'squatCalculationFairwayWidth-' + actionTarget,
          msg: currentCalc?.fairwayWidth ? t(ErrorMessageKeys?.required) || '' : '',
        })
    );
  } else if (
    actionType === 'squatCalculationSlopeScale' &&
    actionTarget !== undefined &&
    validationErrors.find((error) => error.id === 'squatCalculationSlopeScale-' + actionTarget)?.msg
  ) {
    const currentCalc = newState.squatCalculations?.find((c, idx) => idx === actionTarget);
    setValidationErrors(
      validationErrors
        .filter((error) => error.id !== 'squatCalculationSlopeScale-' + actionTarget)
        .concat({
          id: 'squatCalculationSlopeScale-' + actionTarget,
          msg: currentCalc?.slopeScale ? t(ErrorMessageKeys?.required) || '' : '',
        })
    );
  } else if (
    actionType === 'squatCalculationSlopeHeight' &&
    actionTarget !== undefined &&
    validationErrors.find((error) => error.id === 'squatCalculationSlopeHeight-' + actionTarget)?.msg
  ) {
    const currentCalc = newState.squatCalculations?.find((c, idx) => idx === actionTarget);
    setValidationErrors(
      validationErrors
        .filter((error) => error.id !== 'squatCalculationSlopeHeight-' + actionTarget)
        .concat({
          id: 'squatCalculationSlopeHeight-' + actionTarget,
          msg: currentCalc?.slopeHeight ? t(ErrorMessageKeys?.required) || '' : '',
        })
    );
  } else if (
    actionType === 'squatCalculationAdditionalInformation' &&
    actionTarget !== undefined &&
    validationErrors.find((error) => error.id === 'squatCalculationAdditionalInformation-' + actionTarget)?.msg
  ) {
    const currentCalc = newState.squatCalculations?.find((c, idx) => idx === actionTarget);
    setValidationErrors(
      validationErrors
        .filter((error) => error.id !== 'squatCalculationAdditionalInformation-' + actionTarget)
        .concat({
          id: 'squatCalculationAdditionalInformation-' + actionTarget,
          msg:
            currentCalc?.additionalInformation?.fi.trim() ||
            currentCalc?.additionalInformation?.sv.trim() ||
            currentCalc?.additionalInformation?.en.trim()
              ? t(ErrorMessageKeys?.required) || ''
              : '',
        })
    );
  }
};
