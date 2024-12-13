import { t } from 'i18next';
import { FairwayCardInput } from '../../graphql/generated';
import { ActionType, ErrorMessageKeys, Lang, ValidationType, ValueType } from '../constants';

export const fairwayCardSquatCalculationReducer = (
  state: FairwayCardInput,
  value: ValueType,
  actionType: ActionType,
  validationErrors: ValidationType[],
  setValidationErrors: (validationErrors: ValidationType[]) => void,
  actionLang?: Lang,
  actionTarget?: string | number,
  actionOuterTarget?: string | number,
  reservedIds?: string[]
): FairwayCardInput => {
  console.log(actionOuterTarget);
  console.log(reservedIds);

  let newState;
  switch (actionType) {
    case 'squatCalculations':
      // Add and delete
      if (value && !actionTarget) {
        newState = {
          ...state,
          squatCalculations: state.squatCalculations?.concat({
            place: { fi: '', sv: '', en: '' },
            additionalInformation: { fi: '', sv: '', en: '' },
          }),
        };
      } else {
        newState = {
          ...state,
          squatCalculations: state.squatCalculations?.filter((_, idx) => idx !== actionTarget),
        };
      }
      break;
    case 'squatCalculationAdditionalInformation':
      newState = {
        ...state,
        squatCalculations: state.squatCalculations?.map((calcItem, idx) =>
          idx === actionTarget
            ? {
                ...calcItem,
                additionalInformation: {
                  ...(calcItem?.additionalInformation ?? { fi: '', sv: '', en: '' }),
                  [actionLang as string]: value,
                },
              }
            : calcItem
        ),
      };
      break;
    case 'squatCalculationPlace':
      newState = {
        ...state,
        squatCalculations: state.squatCalculations?.map((calcItem, idx) =>
          idx === actionTarget
            ? {
                ...calcItem,
                place: {
                  ...(calcItem?.place ?? { fi: '', sv: '', en: '' }),
                  [actionLang as string]: value,
                },
              }
            : calcItem
        ),
      };
      break;
    case 'squatCalculationDepth':
      console.log('Depth redux');
      newState = {
        ...state,
        squatCalculations: state.squatCalculations?.map((calcItem, idx) =>
          idx === actionTarget
            ? {
                ...calcItem,
                depth: value as number,
              }
            : calcItem
        ),
      };
      console.log(newState.squatCalculations ? newState.squatCalculations[0].depth : '');
      break;
    case 'squatCalculationFairwayForm':
      newState = {
        ...state,
        squatCalculations: state.squatCalculations?.map((calcItem, idx) =>
          idx === actionTarget
            ? {
                ...calcItem,
                fairwayForm: value as number,
              }
            : calcItem
        ),
      };
      break;
    case 'squatCalculationEstimatedWaterDepth':
      newState = {
        ...state,
        squatCalculations: state.squatCalculations?.map((calcItem, idx) =>
          idx === actionTarget
            ? {
                ...calcItem,
                estimatedWaterDepth: value as number,
              }
            : calcItem
        ),
      };
      break;
    case 'squatCalculationFairwayWidth':
      newState = {
        ...state,
        squatCalculations: state.squatCalculations?.map((calcItem, idx) =>
          idx === actionTarget
            ? {
                ...calcItem,
                fairwayWidth: value as number,
              }
            : calcItem
        ),
      };
      break;
    case 'squatCalculationSlopeScale':
      newState = {
        ...state,
        squatCalculations: state.squatCalculations?.map((calcItem, idx) =>
          idx === actionTarget
            ? {
                ...calcItem,
                slopeScale: value as number,
              }
            : calcItem
        ),
      };
      break;
    case 'squatCalculationSlopeHeight':
      newState = {
        ...state,
        squatCalculations: state.squatCalculations?.map((calcItem, idx) =>
          idx === actionTarget
            ? {
                ...calcItem,
                slopeHeight: value as number,
              }
            : calcItem
        ),
      };
      break;
    case 'squatTargetFairwayIds':
      newState = {
        ...state,
        squatCalculations: state.squatCalculations?.map((calcItem, idx) =>
          idx === actionTarget
            ? {
                ...calcItem,
                targetFairways: value as number[],
              }
            : calcItem
        ),
      };
      break;
    case 'squatSuitableFairwayAreaIds':
      newState = {
        ...state,
        squatCalculations: state.squatCalculations?.map((calcItem, idx) =>
          idx === actionTarget
            ? {
                ...calcItem,
                suitableFairwayAreas: value as number[],
              }
            : calcItem
        ),
      };
      break;

    default:
      console.warn(`Unknown action type, state not updated.`);
      return state;
  }

  console.log(validationErrors);
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

  return newState;
};
