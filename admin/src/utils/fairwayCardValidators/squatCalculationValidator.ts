import { t } from 'i18next';
import { FairwayCardInput, SquatCalculationInput } from '../../graphql/generated';
import { ActionType, ErrorMessageKeys, ValidationType } from '../constants';
import { isTextTranslationEmpty } from '../validatorUtils';

export const squatCalculationValidator = (
  newState: FairwayCardInput,
  actionType: ActionType,
  validationErrors: ValidationType[],
  setValidationErrors: (validationErrors: ValidationType[]) => void,
  actionTarget?: string | number
) => {
  const validateMandatoryField = (nullCheck: (calc: SquatCalculationInput | undefined) => boolean) => {
    if (actionTarget !== undefined && validationErrors.find((error) => error.id === actionType + '-' + actionTarget)?.msg) {
      const currentCalc = newState.squatCalculations?.find((c, idx) => idx === actionTarget);
      setValidationErrors(
        validationErrors
          .filter((error) => error.id !== actionType + '-' + actionTarget)
          .concat({
            id: actionType + '-' + actionTarget,
            msg: nullCheck(currentCalc) ? t(ErrorMessageKeys?.required) || '' : '',
          })
      );
    }
  };

  switch (actionType) {
    case 'squatCalculationPlace':
      validateMandatoryField((calc) => isTextTranslationEmpty(calc?.place));
      break;
    case 'squatTargetFairwayIds':
      validateMandatoryField((calc) => (calc?.targetFairways?.length ?? 0) <= 0);
      break;
    case 'squatSuitableFairwayAreaIds':
      validateMandatoryField((calc) => (calc?.suitableFairwayAreas?.length ?? 0) <= 0);
      break;
    case 'squatCalculationEstimatedWaterDepth':
      validateMandatoryField((calc) => !calc?.estimatedWaterDepth);
      break;
    case 'squatCalculationFairwayForm':
      validateMandatoryField((calc) => !calc?.fairwayForm);
      break;
    case 'squatCalculationFairwayWidth':
      validateMandatoryField((calc) => !calc?.fairwayWidth);
      break;
    case 'squatCalculationSlopeScale':
      validateMandatoryField((calc) => !calc?.fairwayWidth);
      break;
    case 'squatCalculationSlopeHeight':
      validateMandatoryField((calc) => !calc?.slopeHeight);
      break;
    default:
      break;
  }
};
