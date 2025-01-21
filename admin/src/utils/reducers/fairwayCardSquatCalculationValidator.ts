import { t } from 'i18next';
import { FairwayCardInput, SquatCalculationInput, TextInput } from '../../graphql/generated';
import { ActionType, ErrorMessageKeys, ValidationType } from '../constants';

export const fairwayCardSquatCalculationValidator = (
  newState: FairwayCardInput,
  actionType: ActionType,
  validationErrors: ValidationType[],
  setValidationErrors: (validationErrors: ValidationType[]) => void,
  actionTarget?: string | number
) => {
  function validateMandatoryField(
    actionTarget: string | number | undefined,
    validationErrors: ValidationType[],
    errorPrefix: string,
    nullCheck: (calc: SquatCalculationInput | undefined) => boolean
  ) {
    if (actionTarget !== undefined && validationErrors.find((error) => error.id === errorPrefix + '-' + actionTarget)?.msg) {
      const currentCalc = newState.squatCalculations?.find((c, idx) => idx === actionTarget);
      setValidationErrors(
        validationErrors
          .filter((error) => error.id !== errorPrefix + '-' + actionTarget)
          .concat({
            id: errorPrefix + '-' + actionTarget,
            msg: nullCheck(currentCalc) ? t(ErrorMessageKeys?.required) || '' : '',
          })
      );
    }
  }

  function isTextTranslationEmpty(text: TextInput | undefined): boolean {
    return text?.fi.trim().length === 0 || text?.sv.trim().length === 0 || text?.en.trim().length === 0;
  }

  switch (actionType) {
    case 'squatCalculationPlace':
      validateMandatoryField(actionTarget, validationErrors, actionType, (calc) => isTextTranslationEmpty(calc?.place));
      break;
    case 'squatTargetFairwayIds':
      validateMandatoryField(actionTarget, validationErrors, actionType, (calc) => (calc?.targetFairways?.length ?? 0) <= 0);
      break;
    case 'squatSuitableFairwayAreaIds':
      validateMandatoryField(actionTarget, validationErrors, actionType, (calc) => (calc?.suitableFairwayAreas?.length ?? 0) <= 0);
      break;
    case 'squatCalculationEstimatedWaterDepth':
      validateMandatoryField(actionTarget, validationErrors, actionType, (calc) => !calc?.estimatedWaterDepth);
      break;
    case 'squatCalculationFairwayForm':
      validateMandatoryField(actionTarget, validationErrors, actionType, (calc) => !calc?.fairwayForm);
      break;
    case 'squatCalculationFairwayWidth':
      validateMandatoryField(actionTarget, validationErrors, actionType, (calc) => !calc?.fairwayWidth);
      break;
    case 'squatCalculationSlopeScale':
      validateMandatoryField(actionTarget, validationErrors, actionType, (calc) => !calc?.fairwayWidth);
      break;
    case 'squatCalculationSlopeHeight':
      validateMandatoryField(actionTarget, validationErrors, actionType, (calc) => !calc?.slopeHeight);
      break;
    default:
      break;
  }
};
